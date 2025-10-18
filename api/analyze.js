export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, transcript } = req.body;

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: "Missing API key" });
  }

  try {
    const systemPrompt = `
Bạn là giám khảo HSK3. Hãy đọc câu hỏi và câu trả lời (bằng tiếng Trung) rồi phân tích:
1. Câu trả lời có hợp lý, đúng trọng tâm với câu hỏi không?
2. Có lỗi ngữ pháp, dùng từ hoặc logic nào không? Giải thích bằng tiếng Việt (có thể thêm tiếng Trung trong ngoặc).
3. Nếu câu sai, hãy sửa lại câu đó cho đúng; nếu đúng, xác nhận và đưa 2 câu tương tự tự nhiên hơn.
Trả về kết quả JSON với các trường:
{
  "verdict": "đúng" hoặc "sai",
  "reason": "Giải thích ngắn bằng tiếng Việt (có thể kèm tiếng Trung)",
  "errors": ["danh sách lỗi ngắn, nếu có"],
  "corrected": "phiên bản sửa đúng (nếu cần)",
  "suggestions": ["2 câu gợi ý tương tự nếu đúng"]
}
`;

    const userPrompt = `Câu hỏi: ${question}\nCâu trả lời: ${transcript}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.2,
        max_tokens: 400,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(500).json({ error: data.error?.message || "OpenAI API error" });
    }

    const content = data.choices[0].message.content;
    res.status(200).json({ ok: true, result: content });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
