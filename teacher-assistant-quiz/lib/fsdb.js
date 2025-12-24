import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');

function readJson(file) {
  const p = path.join(dataDir, file);
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw);
}

function writeJson(file, data) {
  const p = path.join(dataDir, file);
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8');
}

export function getQuestions() {
  return readJson('questions.json');
}

export function getSession() {
  return readJson('session.json');
}

export function setSession(session) {
  writeJson('session.json', session);
}

export function getScores() {
  try {
    return readJson('scores.json');
  } catch (e) {
    // اگر فایل وجود ندارد، ایجادش کن
    writeJson('scores.json', []);
    return [];
  }
}

export function setScores(scores) {
  writeJson('scores.json', scores);
}
