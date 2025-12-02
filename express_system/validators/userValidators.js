const { body, param } = require('express-validator');

const idParam = param('id')
  .isInt({ gt: 0 })
  .withMessage('User id must be a positive integer');

const nameValidator = body('name')
  .isString()
  .withMessage('Name must be a string')
  .bail()
  .trim()
  .notEmpty()
  .withMessage('Name must be a non-empty string');

const ageValidator = body('age')
  .isInt({ gt: 0 })
  .withMessage('Age must be a positive integer');

const createUserRules = [nameValidator, ageValidator];
const updateUserRules = [nameValidator, ageValidator];

module.exports = {
  createUserRules,
  updateUserRules,
  idParam
};
