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
    const { category, name, price, description } = JSON.parse(event.body);
    if (!category || !name || !price) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields: category, name, and price are required' }),
      };
    }

    const result = await pool.query(
      'INSERT INTO menu_items (category, name, price, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [category, name, parseFloat(price), description || null]
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