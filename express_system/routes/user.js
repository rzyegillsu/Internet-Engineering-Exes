const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/user');
const validateRequest = require('../middleware/validateRequest');
const { createUserRules, updateUserRules, idParam } = require('../validators/userValidators');

router.get('/', ctrl.list);

router.get('/:id', idParam, validateRequest, ctrl.get);

router.post('/', createUserRules, validateRequest, ctrl.create);

router.put('/:id', [idParam, ...updateUserRules], validateRequest, ctrl.update);

router.delete('/:id', idParam, validateRequest, ctrl.del);

module.exports = router;