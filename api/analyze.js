export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { question, transcript } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Thiếu OpenAI API key" });
  }

  try {
    const systemPrompt = `
Bạn là giám khảo HSK3. Phải TRẢ LỜI CHÍNH XÁC THEO CẤU TRÚC JSON sau đây, không thêm chữ thừa ngoài JSON.

{
  "verdict": "đúng" hoặc "sai",
  "reason": "Giải thích ngắn bằng tiếng Việt (có thể kèm tiếng Trung)",
  "errors": ["liệt kê lỗi nếu có, nếu không để mảng rỗng"],
  "corrected": "câu sửa đúng (nếu có)",
  "suggestions": ["2 câu gợi ý tương tự tự nhiên nếu câu đúng"]
}

Nhiệm vụ của bạn:
1. Đọc câu hỏi HSK3 và câu trả lời của học viên (bằng tiếng Trung).
2. Xác định xem học viên đã trả lời đúng trọng tâm, hợp ngữ pháp, hợp ngữ nghĩa chưa.
3. Nếu sai → ghi rõ lỗi và sửa lại.
4. Nếu đúng → xác nhận, rồi gợi ý vài cách nói tương tự tự nhiên hơn.
5. Trả về đúng định dạng JSON trên, KHÔNG được thêm mô tả bên ngoài JSON.
`;

    const userPrompt = `Câu hỏi: ${question}\nCâu trả lời của học viên: ${transcript}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("OpenAI API error:", data);
      return res.status(500).json({ error: data.error?.message || "OpenAI API error" });
    }

    const raw = data.choices[0].message.content.trim();

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      // Nếu không phải JSON hợp lệ, gói lại để hiển thị dạng fallback
      parsed = {
        verdict: "không xác định",
        reason: "Phản hồi AI không ở dạng JSON hợp lệ.",
        corrected: "—",
        suggestions: [raw],
      };
    }

    res.status(200).json({ ok: true, parsed, raw });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
