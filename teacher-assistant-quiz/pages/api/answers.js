import { getQuestions, getScores, setScores, getSession } from '../../lib/fsdb';

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, questionId, optionIndex } = req.body || {};
  if (!name || typeof questionId !== 'number' || typeof optionIndex !== 'number') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const session = getSession();
  if (!session.isOpen) {
    return res.status(403).json({ error: 'Quiz is closed' });
  }
  if (session.activeQuestionId !== questionId) {
    return res.status(409).json({ error: 'Question not active' });
  }

  const questions = getQuestions();
  const q = questions.find(q => q.id === questionId);
  if (!q) return res.status(404).json({ error: 'Question not found' });

  const isCorrect = q.answer === optionIndex;

  const scores = getScores();
  const now = Date.now();
  const idx = scores.findIndex(s => s.name === name);

  if (idx === -1) {
    scores.push({
      name,
      correct: isCorrect ? 1 : 0,
      total: 1,
      lastAnswerAt: now
    });
  } else {
    scores[idx].correct += isCorrect ? 1 : 0;
    scores[idx].total += 1;
    scores[idx].lastAnswerAt = now;
  }

  setScores(scores);

  res.status(200).json({ ok: true, isCorrect });
}
