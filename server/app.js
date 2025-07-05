const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Transaction = require('./models/Transaction');
const User = require('./models/User');

const app = express();
const PORT = 5000;
const JWT_SECRET = 'your-secret-key'; // 🔐 Replace with env var in production

app.use(cors());
app.use(bodyParser.json());

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/finSightDB')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ---------------- AUTH ROUTES ----------------

// Register
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { name: user.name, email: user.email } });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// ---------------- PROTECTED MIDDLEWARE ----------------

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Missing token' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// ---------------- TRANSACTION ROUTES ----------------

// Get all transactions (protected)
app.get('/api/transactions', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Add new transaction (protected)
app.post('/api/transactions', authMiddleware, async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  if (!type || !amount || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newTxn = new Transaction({ type, amount, category, note, date, userId: req.userId });
    await newTxn.save();
    res.status(201).json(newTxn);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save transaction' });
  }
});

// Delete transaction (protected)
app.delete('/api/transactions/:id', authMiddleware, async (req, res) => {
  try {
    await Transaction.deleteOne({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Transaction deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete transaction' });
  }
});

// Update transaction (protected)
app.put('/api/transactions/:id', authMiddleware, async (req, res) => {
  const { type, amount, category, note, date } = req.body;

  try {
    const updatedTxn = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { type, amount, category, note, date },
      { new: true }
    );
    res.json(updatedTxn);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update transaction' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
