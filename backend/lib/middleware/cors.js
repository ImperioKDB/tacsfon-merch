
export function applyCors(req, res) {
  const origin = req.headers.origin;
  
  // Hardened CORS: allow localhost and all Vercel subdomains
  const isVercel = origin && (origin.endsWith('.vercel.app') || origin === 'http://localhost:3000');

  if (origin && isVercel) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
