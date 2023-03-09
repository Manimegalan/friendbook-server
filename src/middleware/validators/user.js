const { body, query, param, validationResult } = require("express-validator");

const register = () => {
  return [
    body("username").not().isEmpty(),
    body("email").not().isEmpty().isEmail(),
    body("password").not().isEmpty(),
    body("gender").not().isEmpty().isIn(["male", "female", "other"]),
    body("mobileNumber").not().isEmpty(),
  ];
};

const login = () => {
  return [
    body("email").not().isEmpty().isEmail(),
    body("password").not().isEmpty(),
  ];
};

const forgotPassword = () => {
  return [body("email").not().isEmpty().isEmail()];
};

const resetPassword = () => {
  return [
    body("password").not().isEmpty(),
    body("resetString").not().isEmpty(),
  ];
};

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map((err) =>
    extractedErrors.push({
      [err.param]: err.msg,
    })
  );
  return res.status(400).json({ errors: errors.array() });
};

module.exports = { register, login, forgotPassword, resetPassword, validate };
