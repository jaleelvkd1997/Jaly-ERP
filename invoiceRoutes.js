const express = require('express');
const router = express.Router();
const pool = require('../db');

// Create invoice for an order
router.post('/', async (req, res) => {
  const { order_id, due_date } = req.body;

  try {
    // Get the total amount from the order
    const orderResult = await pool.query(`SELECT total_amount FROM orders WHERE id = $1`, [order_id]);
    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const totalAmount = orderResult.rows[0].total_amount;

    // Create invoice
    const invoiceResult = await pool.query(
      `INSERT INTO invoices (order_id, due_date, total_amount) VALUES ($1, $2, $3) RETURNING *`,
      [order_id, due_date, totalAmount]
    );

    res.json({ message: 'Invoice created', invoice: invoiceResult.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all invoices
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, o.customer_id, c.name AS customer_name
      FROM invoices i
      JOIN orders o ON i.order_id = o.id
      JOIN customers c ON o.customer_id = c.id
      ORDER BY i.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
