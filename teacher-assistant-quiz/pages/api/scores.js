import { getScores } from '../../lib/fsdb';

export default function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  const scores = getScores()
    .sort((a, b) => {
      if (b.correct !== a.correct) return b.correct - a.correct;
      return (a.lastAnswerAt || 0) - (b.lastAnswerAt || 0);
    });
  res.status(200).json({ scores });
}
