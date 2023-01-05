const Joi = require("joi");
const userSchemaJoi = Joi.object({
  firstName: Joi.string().alphanum().min(2).max(20).required(),
  lastName: Joi.string().alphanum().min(2).max(20).required(),
  password: Joi.string().min(6),
  email: Joi.string().email({
    minDomainSegments: 2,
  }),
});
const validateNewUser = (user) => {
  let valid = userSchemaJoi.validate(user);
  if (valid.error) {
    let errorMessage = valid.error.details[0].message;
    return { valid: false, message: errorMessage };
  }
  return { valid: true, message: "Valid" };
};
module.exports = validateNewUser;
