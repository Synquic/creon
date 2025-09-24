import { body, param, query, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";

// Export express-validator functions for use in other files
export { body, param, query };

export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array(),
    });
    return;
  }

  next();
};

export const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be 3-20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),

  body("email")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  body("firstName")
    .optional()
    .isLength({ max: 50 })
    .withMessage("First name cannot exceed 50 characters"),

  body("lastName")
    .optional()
    .isLength({ max: 50 })
    .withMessage("Last name cannot exceed 50 characters"),
];

export const loginValidation = [
  body("identifier").notEmpty().withMessage("Username or email is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

export const linkValidation = [
  body("title")
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title cannot exceed 100 characters"),

  body("url").isURL().withMessage("Please provide a valid URL"),

  body("shortCode")
    .optional()
    .isLength({ min: 4, max: 50 })
    .withMessage("Short code must be 4-50 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Short code can only contain letters, numbers, hyphens, and underscores"
    ),

  body("description")
    .optional()
    .isLength({ max: 250 })
    .withMessage("Description cannot exceed 250 characters"),

  body("type")
    .optional()
    .isIn(["link", "header", "social", "product_collection"])
    .withMessage("Invalid link type"),
];

export const productValidation = [
  body("title")
    .notEmpty()
    .withMessage("Product title is required")
    .isLength({ max: 150 })
    .withMessage("Title cannot exceed 150 characters"),

  body("affiliateUrl")
    .isURL()
    .withMessage("Please provide a valid affiliate URL"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a positive number"),

  body("currency")
    .optional()
    .isLength({ min: 3, max: 3 })
    .withMessage("Currency code must be 3 characters")
    .isUppercase()
    .withMessage("Currency code must be uppercase"),

  body("description")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Description cannot exceed 500 characters"),

  body("shortCode")
    .optional()
    .isLength({ min: 4, max: 50 })
    .withMessage("Short code must be 4-50 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Short code can only contain letters, numbers, hyphens, and underscores"
    ),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .isLength({ max: 30 })
    .withMessage("Each tag cannot exceed 30 characters"),
];

export const usernameValidation = [
  param("username")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be 3-20 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
];

export const shortCodeValidation = [
  param("shortCode")
    .isLength({ min: 4, max: 50 })
    .withMessage("Short code must be 4-50 characters")
    .matches(/^[a-zA-Z0-9_-]+$/)
    .withMessage(
      "Short code can only contain letters, numbers, hyphens, and underscores"
    ),
];

export const paginationValidation = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "updatedAt", "clickCount", "order"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];
