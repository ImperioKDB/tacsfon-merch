export function applyCors(req, res) {
  const origin = req.headers.origin;
  const isAllowed = origin && (
    origin.endsWith('.vercel.app') || 
    origin === 'http://localhost:3000'
  );

  if (origin && isAllowed) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  } else {
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