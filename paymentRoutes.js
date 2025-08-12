const express = require('express');
const router = express.Router();
const pool = require('../db');

// Record a payment
router.post('/', async (req, res) => {
  const { invoice_id, amount, method, notes } = req.body;

  try {
    // Check if invoice exists
    const invoiceResult = await pool.query(`SELECT total_amount, status FROM invoices WHERE id = $1`, [invoice_id]);
    if (invoiceResult.rows.length === 0) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Insert payment
    const paymentResult = await pool.query(
      `INSERT INTO payments (invoice_id, amount, method, notes) VALUES ($1, $2, $3, $4) RETURNING *`,
      [invoice_id, amount, method, notes]
    );

    // Update invoice status if fully paid
    const totalPaidResult = await pool.query(
      `SELECT SUM(amount) AS total_paid FROM payments WHERE invoice_id = $1`,
      [invoice_id]
    );
    const totalPaid = parseFloat(totalPaidResult.rows[0].total_paid);
    const totalAmount = parseFloat(invoiceResult.rows[0].total_amount);

    let newStatus = 'Partially Paid';
    if (totalPaid >= totalAmount) {
      newStatus = 'Paid';
    }

    await pool.query(`UPDATE invoices SET status = $1 WHERE id = $2`, [newStatus, invoice_id]);

    res.json({ message: 'Payment recorded', payment: paymentResult.rows[0], status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all payments
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, i.order_id
      FROM payments p
      JOIN invoices i ON p.invoice_id = i.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
