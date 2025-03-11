const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { items, location, total, instructions, customerName, phone } = JSON.parse(event.body);
    const result = await pool.query(
      'INSERT INTO orders (order_items, location, total_price, instructions, customer_name, phone, order_date, status) VALUES ($1, $2, $3, $4, $5, $6, NOW(), $7) RETURNING *',
      [JSON.stringify(items), location, total, instructions, customerName, phone, 'pending']
    );
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify(result.rows[0]),
    };
  } catch (err) {
    console.error(err.stack);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server error' }),
    };
  }
};