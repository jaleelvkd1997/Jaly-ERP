const express = require('express');
require('dotenv').config();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const authenticateToken = require('./middleware/authMiddleware');

app.get('/api/secret', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}, this is your secret ERP data.` });
});

app.get('/', (req, res) => {
  res.send('ERP backend is running');
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});