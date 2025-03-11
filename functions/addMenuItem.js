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
    const { category, name, price, description, requiresTwoSides } = JSON.parse(event.body);
    const result = await pool.query(
      'INSERT INTO menu_items (category, name, price, description, requires_two_sides) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [category, name, price, description, requiresTwoSides || false]
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