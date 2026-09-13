const { app } = require('@azure/functions');
const mysql = require('mysql2/promise');

app.http('getCompetitions', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    let pool;
    try {
      pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
        ssl: { rejectUnauthorized: true },
        waitForConnections: true,
        connectionLimit: 5
      });

      // Fetch only non-sensitive records for the frontend
      const [rows] = await pool.query(
        'SELECT id, slug, title, starts_at, ends_at FROM competitions WHERE is_active = 1'
      );

      return {
        status: 200,
        jsonBody: rows
      };
    } catch (error) {
      context.error('Database connection error:', error.message);
      return {
        status: 500,
        jsonBody: { error: 'Failed to retrieve competition records.' }
      };
    } finally {
      if (pool) await pool.end();
    }
  }
});