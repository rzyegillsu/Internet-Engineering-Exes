const express = require('express');
const router = express.Router();

let todos = [];
let nextId = 1;

// Helper: find by id
function findTodo(id) {
return todos.find(t => t.id === Number(id));
}

// GET /api/todos?done=true|false (filtering by query)
router.get('/', (req, res) => {
const { done } = req.query;
if (done === 'true') return res.json(todos.filter(t => t.done === true));
if (done === 'false') return res.json(todos.filter(t => t.done === false));
res.json(todos);
});

// GET /api/todos/:id
router.get('/:id', (req, res) => {
const todo = findTodo(req.params.id);
if (!todo) return res.status(404).json({ error: 'Todo not found' });
res.json(todo);
});

// POST /api/todos
router.post('/', (req, res) => {
const { text } = req.body;
if (!text || typeof text !== 'string' || text.trim() === '') {
return res.status(400).json({ error: 'Text is required' });
}
const todo = { id: nextId++, text: text.trim(), done: false, createdAt: new Date().toISOString() };
todos.push(todo);
res.status(201).json(todo);
});

// PUT /api/todos/:id (toggle done or replace fields)
router.put('/:id', (req, res) => {
const todo = findTodo(req.params.id);
if (!todo) return res.status(404).json({ error: 'Todo not found' });


if (!req.body || Object.keys(req.body).length === 0) {
todo.done = !todo.done;
} else {
const { text, done } = req.body;
if (typeof text === 'string') todo.text = text.trim();
if (typeof done === 'boolean') todo.done = done;
}


res.json(todo);
});

// DELETE /api/todos/:id
router.delete('/:id', (req, res) => {
const id = Number(req.params.id);
const before = todos.length;
todos = todos.filter(t => t.id !== id);
if (todos.length === before) return res.status(404).json({ error: 'Todo not found' });
res.status(204).end();
});


module.exports = router;