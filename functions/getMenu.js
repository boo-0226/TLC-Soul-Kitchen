const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon
});

exports.handler = async (event, context) => {
  try {
    const result = await pool.query('SELECT * FROM menu_items');
    return {
      statusCode: 200,
      body: JSON.stringify(result.rows),
    };
  } catch (error) {
    console.error('Error fetching menu items:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  } finally {
    await pool.end();
  }
};