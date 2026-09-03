export default async function handler(req, res) {
  // Add CORS headers for Vercel just in case
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body;
    const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
    const baseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

    if (!serviceRoleKey || !baseUrl) {
      return res.status(500).json({ error: 'Server missing Supabase credentials' });
    }

    const authRes = await fetch(`${baseUrl}/auth/v1/admin/users`, {
      method: 'POST',
      headers: {
        'apikey': serviceRoleKey,
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: password || `${email.split('@')[0]}@1001`,
        email_confirm: true
      })
    });

    const authData = await authRes.json();
    
    if (!authRes.ok) {
      return res.status(authRes.status).json({ error: authData.message || authData.msg || 'Failed to create auth user' });
    }

    return res.status(200).json({ success: true, id: authData.id });
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
