const express = require('express');
const router = express.Router();
const pool = require('../db');

// CREATE Customer
router.post('/', async (req, res) => {
  const { name, email, phone, address } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO customers (name, email, phone, address)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, email, phone, address]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET All Customers
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customers ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE Customer
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, address } = req.body;
  try {
    const result = await pool.query(
      `UPDATE customers 
       SET name = $1, email = $2, phone = $3, address = $4
       WHERE id = $5
       RETURNING *`,
      [name, email, phone, address, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE Customer
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM customers WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted', customer: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;