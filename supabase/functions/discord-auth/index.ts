import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { action, code } = await req.json()

    if (action === 'login') {
      // Discord OAuth2 login redirect
      const clientId = Deno.env.get('DISCORD_CLIENT_ID')
      const redirectUri = `${req.headers.get('origin')}/auth/callback`
      const scope = 'identify guilds'
      
      const discordUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent(scope)}`
      
      return new Response(
        JSON.stringify({ url: discordUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'callback') {
      // Handle Discord OAuth2 callback
      const clientId = Deno.env.get('DISCORD_CLIENT_ID')
      const clientSecret = Deno.env.get('DISCORD_CLIENT_SECRET')
      const redirectUri = `${req.headers.get('origin')}/auth/callback`

      // Exchange code for token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          grant_type: 'authorization_code',
          code: code,
          redirect_uri: redirectUri,
        }),
      })

      const tokenData = await tokenResponse.json()
      
      if (tokenData.error) {
        throw new Error(tokenData.error_description)
      }

      // Get user info
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })
      const userData = await userResponse.json()

      // Get user guilds
      const guildsResponse = await fetch('https://discord.com/api/users/@me/guilds', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` }
      })
      const guildsData = await guildsResponse.json()

      // Create Supabase client
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      )

      // Store user data in profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          discord_id: userData.id,
          username: userData.username,
          avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
          guilds: guildsData,
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          last_login: new Date().toISOString()
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
      }

      return new Response(
        JSON.stringify({
          user: {
            id: userData.id,
            username: userData.username,
            avatar: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null
          },
          guilds: guildsData
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Discord auth error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})