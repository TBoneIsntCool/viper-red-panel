import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));
app.use(express.json());

// MySQL connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'admin',
  password: process.env.DB_PASSWORD || 'IloveANDhaTeSteaK!2399@@',
  database: process.env.DB_NAME || 'mydb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

const pool = mysql.createPool(dbConfig);

// Discord OAuth2 routes
app.post('/auth/discord', async (req, res) => {
  try {
    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify%20guilds`;
    
    res.json({ url: discordAuthUrl });
  } catch (error) {
    console.error('Discord auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

app.post('/auth/callback', async (req, res) => {
  const { code } = req.body;
  
  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await axios.post('https://discord.com/api/oauth2/token', 
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    const { access_token } = tokenResponse.data;

    // Get user info from Discord
    const userResponse = await axios.get('https://discord.com/api/users/@me', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const discordUser = userResponse.data;
    
    // Get user's guilds
    const guildsResponse = await axios.get('https://discord.com/api/users/@me/guilds', {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const guilds = guildsResponse.data;

    // Store/update user in database
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        `INSERT INTO users (discord_id, username, avatar, access_token, guilds_data, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, NOW(), NOW()) 
         ON DUPLICATE KEY UPDATE 
         username = VALUES(username), 
         avatar = VALUES(avatar), 
         access_token = VALUES(access_token), 
         guilds_data = VALUES(guilds_data), 
         updated_at = NOW()`,
        [
          discordUser.id,
          discordUser.username,
          discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
          access_token,
          JSON.stringify(guilds)
        ]
      );

      const user = {
        id: discordUser.id,
        username: discordUser.username,
        avatar: discordUser.avatar ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png` : null,
      };

      res.json({ user });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Discord callback error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Authentication callback failed' });
  }
});

// Get user data
app.get('/api/me/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT discord_id, username, avatar FROM users WHERE discord_id = ?',
        [userId]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = rows[0];
      res.json({ 
        user: {
          id: user.discord_id,
          username: user.username,
          avatar: user.avatar
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user data' });
  }
});

// Panel data endpoints
app.get('/api/panel/:userId', async (req, res) => {
  const { userId } = req.params;
  
  try {
    const connection = await pool.getConnection();
    try {
      // Get recent moderation logs
      const [moderationLogs] = await connection.execute(
        `SELECT ml.*, u.username as moderator_name 
         FROM moderation_logs ml 
         LEFT JOIN users u ON ml.moderator_id = u.discord_id 
         ORDER BY ml.created_at DESC 
         LIMIT 10`
      );

      // Get server stats
      const [memberStats] = await connection.execute(
        'SELECT COUNT(*) as total_members FROM server_members WHERE left_at IS NULL'
      );

      const [todayActions] = await connection.execute(
        'SELECT COUNT(*) as today_actions FROM moderation_logs WHERE DATE(created_at) = CURDATE()'
      );

      const [activeShifts] = await connection.execute(
        'SELECT COUNT(*) as active_moderators FROM shifts WHERE status = "active"'
      );

      const [totalShiftTime] = await connection.execute(
        `SELECT SUM(TIMESTAMPDIFF(SECOND, start_time, COALESCE(end_time, NOW()))) as total_seconds 
         FROM shifts WHERE DATE(start_time) = CURDATE()`
      );

      const serverStats = {
        activeMembers: memberStats[0]?.total_members || 0,
        moderationsToday: todayActions[0]?.today_actions || 0,
        activeModerators: activeShifts[0]?.active_moderators || 0,
        totalShiftTime: Math.floor((totalShiftTime[0]?.total_seconds || 0) / 3600) // Convert to hours
      };

      res.json({
        moderationLogs: moderationLogs.map(log => ({
          id: log.id,
          action: log.action_type,
          moderator: log.moderator_name || 'Unknown',
          target: log.target_user,
          reason: log.reason,
          timestamp: log.created_at
        })),
        serverStats
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Panel data error:', error);
    res.status(500).json({ error: 'Failed to get panel data' });
  }
});

// Shift management
app.post('/api/shift/start', async (req, res) => {
  const { userId } = req.body;
  
  try {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO shifts (user_id, start_time, status) VALUES (?, NOW(), "active")',
        [userId]
      );
      
      res.json({ success: true, message: 'Shift started successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Start shift error:', error);
    res.status(500).json({ error: 'Failed to start shift' });
  }
});

app.post('/api/shift/end', async (req, res) => {
  const { userId } = req.body;
  
  try {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'UPDATE shifts SET end_time = NOW(), status = "completed" WHERE user_id = ? AND status = "active"',
        [userId]
      );
      
      res.json({ success: true, message: 'Shift ended successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('End shift error:', error);
    res.status(500).json({ error: 'Failed to end shift' });
  }
});

// Log moderation action
app.post('/api/moderation/log', async (req, res) => {
  const { moderatorId, action, targetUser, reason, serverId } = req.body;
  
  try {
    const connection = await pool.getConnection();
    try {
      await connection.execute(
        'INSERT INTO moderation_logs (server_id, moderator_id, action_type, target_user, reason, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [serverId || 'default_server', moderatorId, action, targetUser, reason]
      );
      
      res.json({ success: true, message: 'Action logged successfully' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Log moderation error:', error);
    res.status(500).json({ error: 'Failed to log action' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});