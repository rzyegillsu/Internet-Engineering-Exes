import { getSession } from '../../lib/fsdb';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const session = getSession();
  res.status(200).json(session);
}
