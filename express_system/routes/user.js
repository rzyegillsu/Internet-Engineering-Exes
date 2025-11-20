const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user');


// GET /api/users
router.get('/', ctrl.list);
// GET /api/users/:id
router.get('/:id', ctrl.get);
// POST /api/users
router.post('/', ctrl.create);
// PUT /api/users/:id
router.put('/:id', ctrl.update);
// DELETE /api/users/:id
router.delete('/:id', ctrl.del);


module.exports = router;