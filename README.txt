==========================
HSK3 AI SPEAKING PRACTICE
==========================

📘 Mục tiêu:
Tạo một web luyện nói HSK3 có trí tuệ nhân tạo (GPT-4o-mini) giúp:
- Phân tích xem câu trả lời có đúng trọng tâm không
- Phát hiện lỗi ngữ pháp / logic
- Đưa ra câu trả lời mẫu gợi ý
- Hiển thị kết quả bằng tiếng Việt thân thiện

=================================
I. Cấu trúc thư mục (sau khi giải nén)
=================================

HSK3-AI-Speaking-Practice/
│
├── index.html          (giao diện web luyện nói)
├── api/
│   └── analyze.js      (mã serverless gọi GPT-4o-mini)
├── questions.json      (45 câu hỏi HSK3)
└── README.txt          (tập tin hướng dẫn này)

=========================
II. Chuẩn bị OpenAI API Key
=========================

1. Truy cập https://platform.openai.com/signup để tạo tài khoản (nếu chưa có).
2. Vào:  https://platform.openai.com/account/api-keys
3. Nhấn **Create new secret key** → sao chép đoạn bắt đầu bằng “sk-...”.

Ghi lại khóa này để dán vào Vercel ở bước sau.

=====================
III. Deploy lên Vercel
=====================

1. Tạo tài khoản Vercel (https://vercel.com)
2. Nhấn **Add New → Project → Import** và chọn thư mục này.
3. Khi import xong, vào tab **Settings → Environment Variables**
   - Thêm biến:
     ```
     Name: OPENAI_API_KEY
     Value: sk-... (API key bạn đã lấy)
     ```
4. Nhấn **Deploy**.
5. Sau khi deploy xong, bạn sẽ có đường dẫn kiểu:
