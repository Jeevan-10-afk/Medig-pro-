import { BadRequestError } from '../utils/errors.js';

export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const dataToValidate = req[source];
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details.map((d) => d.message).join(', ');
      return next(new BadRequestError(errorMessage));
    }

    // Replace request data with stripped, validated data
    req[source] = value;
    next();
  };
}
