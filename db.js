const mysql = require("mysql2");
require("dotenv").config();

// สร้าง Connection Pool เพื่อรองรับหลาย Request พร้อมกัน
// ดีกว่าการสร้าง Connection เดี่ยว เพราะจัดการ Connection อัตโนมัติ
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // Endpoint ของ RDS จาก .env
  user: process.env.DB_USER,       // Username ของ Database
  password: process.env.DB_PASS,   // Password ของ Database
  database: process.env.DB_NAME,   // ชื่อ Database
  port: 3306,
  waitForConnections: true,        // รอ Connection ว่างแทนการ Error ทันที
  connectionLimit: 10,             // จำนวน Connection สูงสุดใน Pool
  queueLimit: 0,                   // ไม่จำกัดจำนวน Request ที่รอ
});

// แปลง Pool เป็น Promise เพื่อใช้ async/await ได้สะดวก
const promisePool = pool.promise();

// ทดสอบการเชื่อมต่อตอนเริ่มต้น
pool.getConnection((err, connection) => {
  if (err) {
    console.error("❌ Database Connection Failed:", err.message);
    return;
  }
  console.log("✅ Database Connected Successfully!");
  connection.release(); // คืน Connection กลับ Pool หลังใช้งาน
});

module.exports = promisePool;