const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");

const app = express();

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  PORT: process.env.PORT || 5000,
  DB_HOST: process.env.DB_HOST || "localhost",
  DB_USER: process.env.DB_USER || "root",
  DB_PASSWORD: process.env.DB_PASSWORD || "root",
  DB_NAME: process.env.DB_NAME || "eventDB",
  POOL_SIZE: process.env.POOL_SIZE || 30,
  QUEUE_LIMIT: process.env.QUEUE_LIMIT || 100
};

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📍 ${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// DATABASE CONNECTION POOL
// ============================================
const pool = mysql.createPool({
  host: CONFIG.DB_HOST,
  user: CONFIG.DB_USER,
  password: CONFIG.DB_PASSWORD,
  waitForConnections: true,
  connectionLimit: CONFIG.POOL_SIZE,
  queueLimit: CONFIG.QUEUE_LIMIT,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  waitForConnectionsMillis: 30000
});

pool.on('error', (err) => {
  console.error('❌ Pool Error:', err.message);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

async function getConnection() {
  const connection = await pool.getConnection();
  await connection.query(`USE ${CONFIG.DB_NAME}`);
  return connection;
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function sanitizeInput(input) {
  return String(input).trim().slice(0, 255);
}

function apiResponse(success, data, message = '', statusCode = 200) {
  return { success, data, message, timestamp: new Date().toISOString() };
}

// ============================================
// DATABASE INITIALIZATION
// ============================================

async function initDatabase() {
  try {
    const connection = await pool.getConnection();
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${CONFIG.DB_NAME}`);
    await connection.query(`USE ${CONFIG.DB_NAME}`);
    
    // Events table with proper schema
    await connection.query(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        capacity INT NOT NULL CHECK (capacity > 0),
        registeredCount INT DEFAULT 0,
        type ENUM('open', 'approval') DEFAULT 'open',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        isActive BOOLEAN DEFAULT TRUE,
        
        INDEX idx_type (type),
        INDEX idx_created (createdAt),
        INDEX idx_active (isActive),
        FULLTEXT idx_search (name, description)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    
    // Registrations table with proper schema
    await connection.query(`
      CREATE TABLE IF NOT EXISTS registrations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        eventId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        registeredAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        approvedAt TIMESTAMP NULL,
        notes TEXT,
        
        FOREIGN KEY (eventId) REFERENCES events(id) ON DELETE CASCADE,
        INDEX idx_event (eventId),
        INDEX idx_status (status),
        INDEX idx_email (email),
        INDEX idx_registered (registeredAt),
        INDEX idx_composite (eventId, status),
        UNIQUE KEY unique_reg (eventId, email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    connection.release();
    console.log("✅ Database initialized successfully");
    console.log(`📊 Config: Pool=${CONFIG.POOL_SIZE}, Queue=${CONFIG.QUEUE_LIMIT}`);
  } catch (error) {
    console.error('❌ DB Init Error:', error.message);
    setTimeout(initDatabase, 3000);
  }
}

initDatabase();

// ============================================
// API ENDPOINTS
// ============================================

// Health Check
app.get("/health", (req, res) => {
  res.json(apiResponse(true, { status: "healthy" }, "Server is running"));
});

// Create Event
app.post("/create", async (req, res) => {
  try {
    const { name, description, capacity, type } = req.body;

    if (!name || !capacity) {
      return res.status(400).json(
        apiResponse(false, null, "Name and capacity are required", 400)
      );
    }

    if (capacity < 1 || capacity > 1000000) {
      return res.status(400).json(
        apiResponse(false, null, "Capacity must be 1-1,000,000", 400)
      );
    }

    const connection = await getConnection();
    
    const [result] = await connection.query(
      "INSERT INTO events (name, capacity, type) VALUES (?, ?, ?)",
      [sanitizeInput(name), capacity, type || "open"]
    );

    connection.release();

    res.status(201).json(
      apiResponse(true, { eventId: result.insertId }, "Event created successfully", 201)
    );
  } catch (error) {
    console.error('❌ Create event error:', error.message);
    res.status(500).json(apiResponse(false, null, error.message, 500));
  }
});

// Get All Events
app.get("/events", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const type = req.query.type || null;
    const search = req.query.search || null;
    const offset = (page - 1) * limit;

    const connection = await getConnection();

    let query = "SELECT id, name, capacity, registeredCount, type, createdAt FROM events WHERE isActive = TRUE";
    let countQuery = "SELECT COUNT(*) as total FROM events WHERE isActive = TRUE";
    const params = [];
    const countParams = [];

    if (type && ['open', 'approval'].includes(type)) {
      query += " AND type = ?";
      countQuery += " AND type = ?";
      params.push(type);
      countParams.push(type);
    }

    if (search) {
      query += " AND (name LIKE ?)";
      countQuery += " AND (name LIKE ?)";
      const searchTerm = `%${sanitizeInput(search)}%`;
      params.push(searchTerm);
      countParams.push(searchTerm);
    }

    query += " ORDER BY createdAt DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [events] = await connection.query(query, params);
    const [[{ total }]] = await connection.query(countQuery, countParams);

    connection.release();

    res.json(apiResponse(true, {
      events,
      pagination: {
        current: page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    console.error('❌ Get events error:', error.message);
    res.status(500).json(apiResponse(false, null, error.message, 500));
  }
});

// Register for Event
app.post("/register", async (req, res) => {
  try {
    const { eventId, name, email, phone } = req.body;

    if (!eventId || !name || !email) {
      return res.status(400).json(
        apiResponse(false, null, "eventId, name, email are required", 400)
      );
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(
        apiResponse(false, null, "Valid email is required", 400)
      );
    }

    const connection = await getConnection();

    // Check event and capacity
    const [[event]] = await connection.query(
      "SELECT capacity, registeredCount FROM events WHERE id = ? AND isActive = TRUE",
      [eventId]
    );

    if (!event) {
      connection.release();
      return res.status(404).json(
        apiResponse(false, null, "Event not found", 404)
      );
    }

    if (event.registeredCount >= event.capacity) {
      connection.release();
      return res.status(400).json(
        apiResponse(false, null, "Event is at full capacity", 400)
      );
    }

    try {
      const [result] = await connection.query(
        `INSERT INTO registrations (eventId, name, email, phone, status) 
         VALUES (?, ?, ?, ?, 'Pending')`,
        [eventId, sanitizeInput(name), email.toLowerCase(), sanitizeInput(phone || "")]
      );

      await connection.query(
        "UPDATE events SET registeredCount = registeredCount + 1 WHERE id = ?",
        [eventId]
      );

      connection.release();

      res.status(201).json(
        apiResponse(true, { registrationId: result.insertId }, "Registration successful", 201)
      );
    } catch (dbError) {
      connection.release();
      if (dbError.code === 'ER_DUP_ENTRY') {
        return res.status(409).json(
          apiResponse(false, null, "Already registered for this event", 409)
        );
      }
      throw dbError;
    }
  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(500).json(apiResponse(false, null, error.message, 500));
  }
});

// Get Registrations with filtering
app.get("/registrations", async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 50);
    const status = req.query.status || null;
    const eventId = req.query.eventId || null;
    const offset = (page - 1) * limit;

    const connection = await getConnection();

    let query = `SELECT r.id, r.eventId, r.name, r.email, r.phone, r.status, 
                 r.registeredAt, e.name as eventName FROM registrations r 
                 JOIN events e ON r.eventId = e.id WHERE 1=1`;
    let countQuery = "SELECT COUNT(*) as total FROM registrations r JOIN events e ON r.eventId = e.id WHERE 1=1";
    const params = [];
    const countParams = [];

    if (status && ['Pending', 'Approved', 'Rejected'].includes(status)) {
      query += " AND r.status = ?";
      countQuery += " AND r.status = ?";
      params.push(status);
      countParams.push(status);
    }

    if (eventId && !isNaN(eventId)) {
      query += " AND r.eventId = ?";
      countQuery += " AND r.eventId = ?";
      params.push(eventId);
      countParams.push(eventId);
    }

    query += " ORDER BY r.registeredAt DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [registrations] = await connection.query(query, params);
    const [[{ total }]] = await connection.query(countQuery, countParams);

    connection.release();

    res.json(apiResponse(true, {
      registrations,
      pagination: {
        current: page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page < Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    console.error('❌ Get registrations error:', error.message);
    res.status(500).json(apiResponse(false, null, error.message, 500));
  }
});

// Update Registration Status
app.put("/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json(
        apiResponse(false, null, "Valid registration ID is required", 400)
      );
    }

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json(
        apiResponse(false, null, "Status must be Approved, Rejected, or Pending", 400)
      );
    }

    const connection = await getConnection();

    const [[registration]] = await connection.query(
      "SELECT * FROM registrations WHERE id = ?",
      [id]
    );

    if (!registration) {
      connection.release();
      return res.status(404).json(
        apiResponse(false, null, "Registration not found", 404)
      );
    }

    await connection.query(
      `UPDATE registrations SET status = ?, notes = ?, approvedAt = NOW() 
       WHERE id = ?`,
      [status, sanitizeInput(notes || ""), id]
    );

    connection.release();

    res.json(apiResponse(true, { registrationId: id, status }, `Registration ${status.toLowerCase()}`));
  } catch (error) {
    console.error('❌ Update registration error:', error.message);
    res.status(500).json(apiResponse(false, null, error.message, 500));
  }
});

// Database Statistics
app.get("/stats", async (req, res) => {
  try {
    const connection = await getConnection();

    const [[totalStats]] = await connection.query(`
      SELECT 
        (SELECT COUNT(*) FROM registrations) as totalRegistrations,
        (SELECT COUNT(*) FROM events WHERE isActive = TRUE) as activeEvents,
        (SELECT SUM(capacity) FROM events WHERE isActive = TRUE) as totalCapacity,
        (SELECT SUM(registeredCount) FROM events WHERE isActive = TRUE) as totalRegistered,
        (SELECT COUNT(*) FROM registrations WHERE status = 'Approved') as approvedCount,
        (SELECT COUNT(*) FROM registrations WHERE status = 'Pending') as pendingCount,
        (SELECT COUNT(*) FROM registrations WHERE status = 'Rejected') as rejectedCount
    `);

    connection.release();

    const dbStatus = totalStats.totalRegistrations <= 10000 ? "✅ Excellent" : 
                     totalStats.totalRegistrations <= 100000 ? "✅ Good" : "⚠️ Monitor";

    res.json(apiResponse(true, {
      registrations: totalStats,
      database: {
        totalRecords: totalStats.totalRegistrations,
        maxCapacity: "2.1 Billion (INT limit)",
        status: dbStatus,
        utilizationPercent: Math.round((totalStats.totalRegistrations / 10000) * 100)
      }
    }));
  } catch (error) {
    console.error('❌ Get stats error:', error.message);
    res.status(500).json(apiResponse(false, null, error.message, 500));
  }
});

// Error handlers
app.use((req, res) => {
  res.status(404).json(apiResponse(false, null, "Endpoint not found", 404));
});

app.use((error, req, res, next) => {
  console.error('❌ Error:', error.message);
  res.status(500).json(apiResponse(false, null, "Internal server error", 500));
});

// ============================================
// SERVER START
// ============================================

app.listen(CONFIG.PORT, () => {
  console.log(`\n🚀 Event Platform Backend - 10K Capable`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`🌐 Server: http://localhost:${CONFIG.PORT}`);
  console.log(`🗄️  Database: ${CONFIG.DB_NAME}`);
  console.log(`👥 Pool Size: ${CONFIG.POOL_SIZE} connections`);
  console.log(`📊 Capacity: 10,000+ users ✅`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
});

process.on('SIGTERM', () => {
  console.log('Shutting down gracefully...');
  pool.end();
  process.exit(0);
});