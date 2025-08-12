const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateToken = require('../middleware/authMiddleware');

// CREATE product
router.post('/', async (req, res) => {
  const { customer_id, items } = req.body; // items = [{ product_id, quantity }]

  try {
    // 1. Calculate total amount
    let totalAmount = 0;
    for (let item of items) {
      const productResult = await pool.query(`SELECT price, stock FROM products WHERE id = $1`, [item.product_id]);
      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: `Product ID ${item.product_id} not found` });
      }

      const product = productResult.rows[0];
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for Product ID ${item.product_id}` });
      }

      totalAmount += product.price * item.quantity;
    }

    // 2. Create order
    const orderResult = await pool.query(
      `INSERT INTO orders (customer_id, total_amount) VALUES ($1, $2) RETURNING id`,
      [customer_id, totalAmount]
    );
    const orderId = orderResult.rows[0].id;

    // 3. Insert order items & update stock
    for (let item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, (SELECT price FROM products WHERE id = $2))`,
        [orderId, item.product_id, item.quantity]
      );

      await pool.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id]
      );
    }

    res.json({ message: 'Order created & stock updated', order_id: orderId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// READ all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 UPDATE (PUT)
router.put('/:id', async (req, res) => {
  console.log('PUT called with ID:', req.params.id);
  console.log('Body:', req.body);
  const { id } = req.params;
  const { name, description, price, quantity } = req.body;
  try {
    const result = await pool.query(
      `UPDATE products 
       SET name = $1, description = $2, price = $3, quantity = $4 
       WHERE id = $5 RETURNING *`,
      [name, description, price, quantity, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 🟢 DELETE
router.delete('/:id', async (req, res) => {
  console.log('DELETE called with ID:', req.params.id);
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM products WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json({ message: 'Product deleted', product: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;