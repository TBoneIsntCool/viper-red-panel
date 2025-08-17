import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import mysql from "https://deno.land/x/mysql@v2.12.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// MySQL connection
const connection = await mysql.createConnection({
  hostname: 'localhost',
  username: 'admin',
  password: 'IloveANDhaTeSteaK!2399@@',
  db: 'mydb'
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, user_id, server_id, data } = await req.json()

    if (action === 'get_shifts') {
      // Get user shifts
      const result = await connection.execute(`
        SELECT * FROM shifts 
        WHERE user_id = ? AND server_id = ? 
        ORDER BY start_time DESC 
        LIMIT 10
      `, [user_id, server_id])
      
      return new Response(
        JSON.stringify({ shifts: result.rows || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'start_shift') {
      // Start a new shift
      await connection.execute(`
        INSERT INTO shifts (user_id, server_id, start_time, status)
        VALUES (?, ?, NOW(), 'active')
      `, [user_id, server_id])
      
      return new Response(
        JSON.stringify({ success: true, message: 'Shift started' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'end_shift') {
      // End current shift
      await connection.execute(`
        UPDATE shifts 
        SET end_time = NOW(), status = 'completed'
        WHERE user_id = ? AND server_id = ? AND status = 'active'
      `, [user_id, server_id])
      
      return new Response(
        JSON.stringify({ success: true, message: 'Shift ended' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_moderation_logs') {
      // Get recent moderation actions
      const result = await connection.execute(`
        SELECT ml.*, u.username as moderator_name
        FROM moderation_logs ml
        JOIN users u ON ml.moderator_id = u.discord_id
        WHERE ml.server_id = ?
        ORDER BY ml.created_at DESC
        LIMIT 20
      `, [server_id])
      
      return new Response(
        JSON.stringify({ logs: result.rows || [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'log_action') {
      // Log a moderation action
      await connection.execute(`
        INSERT INTO moderation_logs (server_id, moderator_id, action_type, target_user, reason, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())
      `, [server_id, user_id, data.action, data.target, data.reason])
      
      return new Response(
        JSON.stringify({ success: true, message: 'Action logged' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'get_server_stats') {
      // Get server statistics
      const memberCount = await connection.execute(
        'SELECT COUNT(*) as count FROM server_members WHERE server_id = ?',
        [server_id]
      )
      
      const todayModerations = await connection.execute(`
        SELECT COUNT(*) as count FROM moderation_logs 
        WHERE server_id = ? AND DATE(created_at) = CURDATE()
      `, [server_id])
      
      const activeModerators = await connection.execute(`
        SELECT COUNT(DISTINCT moderator_id) as count FROM shifts 
        WHERE server_id = ? AND status = 'active'
      `, [server_id])
      
      const totalShiftTime = await connection.execute(`
        SELECT SUM(TIMESTAMPDIFF(MINUTE, start_time, COALESCE(end_time, NOW()))) as minutes
        FROM shifts 
        WHERE server_id = ? AND DATE(start_time) = CURDATE()
      `, [server_id])
      
      return new Response(
        JSON.stringify({
          memberCount: memberCount.rows?.[0]?.count || 0,
          todayModerations: todayModerations.rows?.[0]?.count || 0,
          activeModerators: activeModerators.rows?.[0]?.count || 0,
          totalShiftTime: totalShiftTime.rows?.[0]?.minutes || 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})