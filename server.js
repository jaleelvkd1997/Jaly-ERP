const express = require('express');
require('dotenv').config();
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const authenticateToken = require('./middleware/authMiddleware');
const productRoutes = require('./routes/productRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);

app.get('/api/secret', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.email}, this is your secret ERP data.` });
});

app.get('/', (req, res) => {
  res.send('ERP backend is running');
});

app.use('/api/products', productRoutes);

app.use('/api/customers', customerRoutes);

app.use('/api/orders', orderRoutes);

app.use('/api/invoices', invoiceRoutes);

app.use('/api/payments', paymentRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});