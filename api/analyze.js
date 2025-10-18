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
Bạn là GIÁO VIÊN HSK3 rất giỏi. 
Nhiệm vụ của bạn là chấm câu trả lời nói của học viên theo 5 yêu cầu sau và TRẢ LỜI BẰNG JSON hợp lệ:

{
  "verdict": "đúng" hoặc "sai",
  "reason": "Giải thích ngắn gọn, nếu sai thì nêu lý do sai và cấu trúc ngữ pháp đúng (ví dụ: “động từ + 得” hay “就” phải đặt sau chủ ngữ...)",
  "errors": ["liệt kê lỗi chính nếu có"],
  "corrected": {
     "sentence": "phiên bản sửa đúng",
     "pinyin": "pinyin của câu sửa",
     "vietnamese": "nghĩa tiếng Việt ngắn gọn"
  },
  "suggestions": [
     {"sentence": "câu tương tự tự nhiên 1", "pinyin": "...", "vietnamese": "..."},
     {"sentence": "câu tương tự tự nhiên 2", "pinyin": "...", "vietnamese": "..."}
  ]
}

Yêu cầu:
- Giải thích bằng tiếng Việt, nhưng có thể chèn ví dụ tiếng Trung trong ngoặc nếu cần.
- Luôn thêm Pinyin và nghĩa Việt cho các câu Trung Quốc.
- Nếu câu trả lời sai, nhấn mạnh phần sai và chỉ ra quy tắc ngữ pháp đúng.
- Nếu câu đúng, vẫn đưa gợi ý cách nói tự nhiên hơn.
Trả về CHUẨN JSON, KHÔNG thêm ký tự thừa ngoài JSON.
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
        temperature: 0.4,
        max_tokens: 700,
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
      parsed = {
        verdict: "không xác định",
        reason: "Phản hồi không ở dạng JSON hợp lệ.",
        corrected: { sentence: "—", pinyin: "", vietnamese: "" },
        suggestions: [{ sentence: raw, pinyin: "", vietnamese: "" }],
      };
    }

    res.status(200).json({ ok: true, parsed, raw });
  } catch (err) {
    console.error("Server error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
