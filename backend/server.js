require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Register player
app.post('/register', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO players (name, wins, losses, draws) VALUES ($1, 0, 0, 0) ON CONFLICT (name) DO NOTHING RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0] || { message: 'Player already exists' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// Submit game result
app.post('/submit-game', async (req, res) => {
  const { player1, player2, result } = req.body;
  try {
    await pool.query(
      'INSERT INTO games (player1, player2, result) VALUES ($1, $2, $3)',
      [player1, player2, result]
    );

    if (result === 'draw') {
      await pool.query('UPDATE players SET draws = draws + 1 WHERE name IN ($1, $2)', [player1, player2]);
    } else {
      const winner = result === 'player1' ? player1 : player2;
      const loser = result === 'player1' ? player2 : player1;
      await pool.query('UPDATE players SET wins = wins + 1 WHERE name = $1', [winner]);
      await pool.query('UPDATE players SET losses = losses + 1 WHERE name = $1', [loser]);
    }

    res.status(200).json({ message: 'Game submitted' });
  } catch (err) {
    res.status(500).json({ error: 'Game submission failed' });
  }
});

// Leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT name, wins, losses, draws FROM players ORDER BY wins DESC, draws DESC LIMIT 10'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Leaderboard fetch failed' });
  }
});

app.listen(port, () => {
  console.log(`Backend running on http://localhost:${port}`);
});
// Get recent games
app.get('/recent-games', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT player1, player2, result, timestamp FROM games ORDER BY timestamp DESC LIMIT 10'
    );
    res.status(200).json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch recent games.' });
  }
});