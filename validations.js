import { body } from 'express-validator';


export const registrationValidation = [
    body('firstName').isLength({ min: 3 }),
    body('lastName').isLength({ min: 3 }),
    body('gender').isLength({ }),
    body('address').isLength( { min: 3 }),
    body('city').isLength(),
    body('phone').isLength( { min: 11 }),
    body('email').isEmail(),
    body('password').isLength( { min: 3 }),
    body('status').isBoolean(),
]

export const loginValidation = [
    body('email').isEmail(),
    body('password').isLength( { min: 3 }),
]