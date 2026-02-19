const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Vercel uses /tmp for writable files, local uses project root
const isVercel = process.env.VERCEL === '1';
const DB_PATH = process.env.DB_PATH || (isVercel 
  ? path.join('/tmp', 'tellme.db')
  : path.join(__dirname, 'tellme.db'));

// Middleware
// CORS - Allow requests from your domain
const allowedOrigins = [
  'https://tellme.adparlay.com',
  'http://localhost:3000',
  'http://localhost:8000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.static(__dirname)); // Serve static files

// Initialize database connection (lazy initialization for serverless)
let db = null;

function getDb() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
      } else {
        console.log('Connected to SQLite database:', DB_PATH);
        initDatabase();
      }
    });
  }
  return db;
}

// Initialize database schema
function initDatabase() {
  const database = getDb();
  database.serialize(() => {
    // Accounts table
    database.run(`CREATE TABLE IF NOT EXISTS accounts (
      handle TEXT PRIMARY KEY,
      pin_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL
    )`);

    // Messages table
    database.run(`CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      handle TEXT NOT NULL,
      text TEXT NOT NULL,
      is_new INTEGER DEFAULT 1,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (handle) REFERENCES accounts(handle) ON DELETE CASCADE
    )`);

    // Index for faster queries
    database.run(`CREATE INDEX IF NOT EXISTS idx_messages_handle ON messages(handle)`);
    database.run(`CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC)`);
  });
}

// Hash PIN (same algorithm as frontend)
function hashPin(pin) {
  let h = 5381;
  for (let i = 0; i < pin.length; i++) {
    h = ((h << 5) + h) + pin.charCodeAt(i);
  }
  return (h >>> 0).toString(36);
}

// API Routes

// Register new account
app.post('/api/register', (req, res) => {
  const { handle, pin } = req.body;

  // Validate handle
  if (!handle || handle.length < 2) {
    return res.status(400).json({ error: 'Handle must be at least 2 characters' });
  }
  
  if (handle.length > 20) {
    return res.status(400).json({ error: 'Handle must be 20 characters or less' });
  }
  
  // Validate handle format (letters, numbers, underscores only)
  if (!/^[a-z0-9_]+$/.test(handle.toLowerCase())) {
    return res.status(400).json({ error: 'Handle can only contain letters, numbers, and underscores' });
  }

  // Validate PIN
  if (!/^\d{4}$/.test(pin)) {
    return res.status(400).json({ error: 'PIN must be 4 digits' });
  }

  const normalizedHandle = handle.toLowerCase().trim();
  const pinHash = hashPin(pin);
  const createdAt = Date.now();

  // Check if handle already exists
  getDb().get(
    'SELECT handle FROM accounts WHERE handle = ?',
    [normalizedHandle],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to check handle availability' });
      }
      
      if (row) {
        return res.status(409).json({ error: `@${normalizedHandle} is already taken` });
      }

      // Create account
      getDb().run(
        'INSERT INTO accounts (handle, pin_hash, created_at) VALUES (?, ?, ?)',
        [normalizedHandle, pinHash, createdAt],
        function(err) {
          if (err) {
            if (err.message.includes('UNIQUE constraint')) {
              return res.status(409).json({ error: `@${normalizedHandle} is already taken` });
            }
            return res.status(500).json({ error: 'Failed to create account' });
          }
          res.json({ success: true, handle: normalizedHandle });
        }
      );
    }
  );
});

// Login
app.post('/api/login', (req, res) => {
  const { handle, pin } = req.body;

  if (!handle || !pin) {
    return res.status(400).json({ error: 'Handle and PIN required' });
  }

  const pinHash = hashPin(pin);

  getDb().get(
    'SELECT handle FROM accounts WHERE handle = ? AND pin_hash = ?',
    [handle.toLowerCase(), pinHash],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Login failed' });
      }
      if (!row) {
        return res.status(401).json({ error: 'Invalid handle or PIN' });
      }
      res.json({ success: true, handle: row.handle });
    }
  );
});

// Get account with messages
app.get('/api/account/:handle', (req, res) => {
  const handle = req.params.handle.toLowerCase();

  getDb().get(
    'SELECT handle, created_at FROM accounts WHERE handle = ?',
    [handle],
    (err, account) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch account' });
      }
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Get messages
      getDb().all(
        `SELECT id, text, is_new, created_at 
         FROM messages 
         WHERE handle = ? 
         ORDER BY created_at DESC`,
        [handle],
        (err, messages) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch messages' });
          }

          const formattedMessages = messages.map(msg => {
            const date = new Date(msg.created_at);
            return {
              id: msg.id,
              text: msg.text,
              isNew: msg.is_new === 1,
              time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              date: date.toLocaleDateString([], { month: 'short', day: 'numeric' })
            };
          });

          res.json({
            handle: account.handle,
            createdAt: account.created_at,
            messages: formattedMessages
          });
        }
      );
    }
  );
});

// Send anonymous question
app.post('/api/question', (req, res) => {
  const { handle, text } = req.body;

  if (!handle || !text || !text.trim()) {
    return res.status(400).json({ error: 'Handle and text required' });
  }

  if (text.length > 280) {
    return res.status(400).json({ error: 'Question too long (max 280 characters)' });
  }

  // Check if account exists
  getDb().get(
    'SELECT handle FROM accounts WHERE handle = ?',
    [handle.toLowerCase()],
    (err, account) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to send question' });
      }
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Insert message
      getDb().run(
        'INSERT INTO messages (handle, text, is_new, created_at) VALUES (?, ?, ?, ?)',
        [handle.toLowerCase(), text.trim(), 1, Date.now()],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to send question' });
          }
          res.json({ success: true, messageId: this.lastID });
        }
      );
    }
  );
});

// Delete message
app.delete('/api/message/:id', (req, res) => {
  const messageId = req.params.id;
  const { handle } = req.body; // Verify ownership

  if (!handle) {
    return res.status(400).json({ error: 'Handle required' });
  }

  getDb().run(
    'DELETE FROM messages WHERE id = ? AND handle = ?',
    [messageId, handle.toLowerCase()],
    function(err) {
      if (err) {
        return res.status(500).json({ error: 'Failed to delete message' });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }
      res.json({ success: true });
    }
  );
});

// Mark messages as read
app.post('/api/messages/read', (req, res) => {
  const { handle } = req.body;

  if (!handle) {
    return res.status(400).json({ error: 'Handle required' });
  }

  getDb().run(
    'UPDATE messages SET is_new = 0 WHERE handle = ? AND is_new = 1',
    [handle.toLowerCase()],
    (err) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to update messages' });
      }
      res.json({ success: true });
    }
  );
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Export for Vercel serverless functions
module.exports = app;

// Only start server if not in Vercel (Vercel handles this automatically)
if (!isVercel) {
  app.listen(PORT, () => {
    console.log(`TellMe server running on http://localhost:${PORT}`);
    console.log(`Database: ${DB_PATH}`);
  });

  // Graceful shutdown
  process.on('SIGINT', () => {
    if (db) {
      db.close((err) => {
        if (err) {
          console.error(err.message);
        }
        console.log('Database connection closed');
        process.exit(0);
      });
    }
  });
}

