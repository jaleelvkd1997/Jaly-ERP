const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create a new order
router.post('/', async (req, res) => {
  const { customer_id, items } = req.body; // items = [{ product_id, quantity }]

  try {
    // Step 1 — Calculate total amount & validate stock
    let totalAmount = 0;
    let productsData = {};

    for (let item of items) {
      const productResult = await pool.query(
        `SELECT price, stock FROM products WHERE id = $1`,
        [item.product_id]
      );

      if (productResult.rows.length === 0) {
        return res.status(404).json({ error: `Product ID ${item.product_id} not found` });
      }

      const product = productResult.rows[0];

      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Not enough stock for Product ID ${item.product_id}` });
      }

      // Save product data for later use
      productsData[item.product_id] = product;

      totalAmount += product.price * item.quantity;
    }

    // Step 2 — Create order
    const orderResult = await pool.query(
      `INSERT INTO orders (customer_id, total_amount) VALUES ($1, $2) RETURNING id`,
      [customer_id, totalAmount]
    );
    const orderId = orderResult.rows[0].id;

    // Step 3 — Insert order items & update stock
    for (let item of items) {
      const product = productsData[item.product_id];

      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) 
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.quantity, product.price]
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

// Get all orders
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order details by ID
router.get('/:id', async (req, res) => {
  try {
    const order = await pool.query('SELECT * FROM orders WHERE id = $1', [req.params.id]);
    const items = await pool.query('SELECT * FROM order_items WHERE order_id = $1', [req.params.id]);

    if (order.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      order: order.rows[0],
      items: items.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
