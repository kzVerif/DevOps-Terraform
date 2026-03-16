const express = require("express");
const dotenv = require("dotenv");

// โหลด Environment Variables จากไฟล์ .env
dotenv.config();

const usersRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

// -------------------------------------------------------
// Middleware
// -------------------------------------------------------

// แปลง Request Body จาก JSON String เป็น Object อัตโนมัติ
app.use(express.json());

// แปลง URL-encoded Form Data เป็น Object (รองรับ HTML Form)
app.use(express.urlencoded({ extended: true }));

// -------------------------------------------------------
// Routes
// -------------------------------------------------------

// Health Check — ตรวจสอบว่า Server ยังทำงานอยู่
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "🚀 Server is Running!",
    version: "1.0.0",
    endpoints: {
      users: "/api/users",
    },
  });
});

// เชื่อม Users Router เข้ากับ Path /api/users
app.use("/api/users", usersRouter);

// Catch-all Route — จัดการกรณีเรียก Path ที่ไม่มีอยู่
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `ไม่พบ Route: ${req.method} ${req.originalUrl}`,
  });
});

// -------------------------------------------------------
// เริ่มต้น Server
// -------------------------------------------------------
app.listen(PORT, "0.0.0.0", () => {
  // Bind กับ 0.0.0.0 เพื่อรับ Request จากภายนอก EC2 ได้
  console.log(`✅ Server started on port ${PORT}`);
  console.log(`📡 API URL: http://localhost:${PORT}/api/users`);
});