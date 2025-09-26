import { body } from 'express-validator';


export const createCourseValidation = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('price')
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('durationHours')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration hours must be a positive integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('courseContent')
    .optional()
    .isArray()
    .withMessage('Course content must be an array'),
  body('courseContent.*.title')
    .if(body('courseContent').exists())
    .notEmpty()
    .withMessage('Content title is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Content title must be between 1 and 255 characters'),
  body('courseContent.*.contentType')
    .if(body('courseContent').exists())
    .notEmpty()
    .withMessage('Content type is required')
    .isIn(['pdf', 'text'])
    .withMessage('Content type must be either pdf or text'),
  body('courseContent.*.filePath')
    .if(body('courseContent').exists())
    .optional()
    .isLength({ max: 500 })
    .withMessage('File path must not exceed 500 characters')
];

export const updateCourseValidation = [
  body('title')
    .optional()
    .isLength({ min: 3, max: 255 })
    .withMessage('Title must be between 3 and 255 characters'),
  body('description')
    .optional()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('price')
    .optional()
    .isNumeric()
    .withMessage('Price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('durationHours')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Duration hours must be a positive integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

export const courseIdValidation = [
  body('courseId')
    .isUUID()
    .withMessage('Course ID must be a valid UUID')
];

export const courseSearchValidation = [
  body('minPrice')
    .optional()
    .isNumeric()
    .withMessage('Minimum price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  body('maxPrice')
    .optional()
    .isNumeric()
    .withMessage('Maximum price must be a number')
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];