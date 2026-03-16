const express = require("express");
const router = express.Router();
const db = require("../db");

// -------------------------------------------------------
// GET /api/users — ดึงข้อมูล Users ทั้งหมด
// -------------------------------------------------------
router.get("/", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM users ORDER BY id ASC");

    // กรณีไม่มีข้อมูลใน Database
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "ไม่พบข้อมูล Users",
      });
    }

    res.status(200).json({
      success: true,
      message: `พบข้อมูลทั้งหมด ${rows.length} รายการ`,
      data: rows,
    });
  } catch (error) {
    console.error("GET /users Error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
});

// -------------------------------------------------------
// GET /api/users/:id — ดึงข้อมูล User ตาม ID
// -------------------------------------------------------
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // ตรวจสอบว่า ID เป็นตัวเลขหรือไม่
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID ต้องเป็นตัวเลขเท่านั้น",
      });
    }

    // ใช้ Parameterized Query ป้องกัน SQL Injection
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบ User ที่มี ID: ${id}`,
      });
    }

    res.status(200).json({
      success: true,
      data: rows[0],
    });
  } catch (error) {
    console.error(`GET /users/${req.params.id} Error:`, error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการดึงข้อมูล",
      error: error.message,
    });
  }
});

// -------------------------------------------------------
// POST /api/users — สร้าง User ใหม่
// -------------------------------------------------------
router.post("/", async (req, res) => {
  try {
    const { name, email } = req.body;

    // ตรวจสอบว่ามีการส่ง name และ email มาครบหรือไม่
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ name และ email ให้ครบถ้วน",
      });
    }

    // ตรวจสอบรูปแบบ Email อย่างง่าย
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "รูปแบบ Email ไม่ถูกต้อง",
      });
    }

    // ตรวจสอบว่า Email ซ้ำกับในระบบหรือไม่
    const [existing] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email นี้ถูกใช้งานแล้วในระบบ",
      });
    }

    // Insert ข้อมูลลง Database
    const [result] = await db.query(
      "INSERT INTO users (name, email) VALUES (?, ?)",
      [name, email]
    );

    res.status(201).json({
      success: true,
      message: "สร้าง User สำเร็จ",
      data: {
        id: result.insertId, // ID ที่ถูกสร้างอัตโนมัติโดย AUTO_INCREMENT
        name,
        email,
      },
    });
  } catch (error) {
    console.error("POST /users Error:", error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการสร้าง User",
      error: error.message,
    });
  }
});

// -------------------------------------------------------
// PUT /api/users/:id — อัปเดตข้อมูล User ทั้งหมด
// -------------------------------------------------------
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID ต้องเป็นตัวเลขเท่านั้น",
      });
    }

    // ตรวจสอบว่ามีข้อมูลครบหรือไม่ (PUT ต้องส่งมาครบทุก Field)
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ name และ email ให้ครบถ้วน",
      });
    }

    // ตรวจสอบว่า User ที่ต้องการแก้ไขมีอยู่จริงหรือไม่
    const [existing] = await db.query(
      "SELECT id FROM users WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบ User ที่มี ID: ${id}`,
      });
    }

    // อัปเดตข้อมูลใน Database
    await db.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [name, email, id]
    );

    res.status(200).json({
      success: true,
      message: "อัปเดต User สำเร็จ",
      data: { id: parseInt(id), name, email },
    });
  } catch (error) {
    console.error(`PUT /users/${req.params.id} Error:`, error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดต User",
      error: error.message,
    });
  }
});

// -------------------------------------------------------
// PATCH /api/users/:id — อัปเดตข้อมูล User บางส่วน
// -------------------------------------------------------
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID ต้องเป็นตัวเลขเท่านั้น",
      });
    }

    // ต้องส่งมาอย่างน้อย 1 Field
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: "กรุณาระบุ name หรือ email อย่างน้อย 1 อย่าง",
      });
    }

    // ตรวจสอบว่า User มีอยู่จริงหรือไม่
    const [existing] = await db.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบ User ที่มี ID: ${id}`,
      });
    }

    // สร้าง Query แบบ Dynamic โดยอัปเดตเฉพาะ Field ที่ส่งมา
    const updatedName = name || existing[0].name;
    const updatedEmail = email || existing[0].email;

    await db.query(
      "UPDATE users SET name = ?, email = ? WHERE id = ?",
      [updatedName, updatedEmail, id]
    );

    res.status(200).json({
      success: true,
      message: "อัปเดต User บางส่วนสำเร็จ",
      data: { id: parseInt(id), name: updatedName, email: updatedEmail },
    });
  } catch (error) {
    console.error(`PATCH /users/${req.params.id} Error:`, error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการอัปเดต User",
      error: error.message,
    });
  }
});

// -------------------------------------------------------
// DELETE /api/users/:id — ลบ User ตาม ID
// -------------------------------------------------------
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID ต้องเป็นตัวเลขเท่านั้น",
      });
    }

    // ตรวจสอบว่า User มีอยู่จริงก่อนลบ
    const [existing] = await db.query(
      "SELECT id, name FROM users WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        message: `ไม่พบ User ที่มี ID: ${id}`,
      });
    }

    await db.query("DELETE FROM users WHERE id = ?", [id]);

    res.status(200).json({
      success: true,
      message: `ลบ User "${existing[0].name}" สำเร็จ`,
      deletedId: parseInt(id),
    });
  } catch (error) {
    console.error(`DELETE /users/${req.params.id} Error:`, error.message);
    res.status(500).json({
      success: false,
      message: "เกิดข้อผิดพลาดในการลบ User",
      error: error.message,
    });
  }
});

module.exports = router;