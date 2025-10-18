export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { question, answer } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "Missing OpenAI API key" });
    }

    const prompt = `
Bạn là giáo viên tiếng Trung chấm thi HSK3. 
Hãy đọc câu hỏi "${question}" và câu trả lời "${answer}" của học viên.
1. Nhận xét câu trả lời có hợp lý, đúng ngữ pháp và phù hợp với câu hỏi không.
2. Nếu có lỗi sai, chỉ rõ lỗi và gợi ý câu sửa đúng.
3. Nếu câu đúng, xác nhận và đưa ra vài cách nói tương tự.
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message || "OpenAI error" });
    }

    res.status(200).json({ feedback: data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
}
