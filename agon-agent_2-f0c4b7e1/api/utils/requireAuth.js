import fetch from 'node-fetch';

export default async function requireAuth(req, res) {
  const header = req.headers.authorization || req.headers.Authorization;
  const token = header && header.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Authorization token missing' });
    return null;
  }

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, '')}/auth/v1/user`;
  try {
    const r = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        apikey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      }
    });

    if (!r.ok) {
      res.status(401).json({ error: 'Invalid or expired token' });
      return null;
    }

    const user = await r.json();
    return user;
  } catch (err) {
    console.error('requireAuth error', err);
    res.status(500).json({ error: 'Auth verification failed' });
    return null;
  }
}
