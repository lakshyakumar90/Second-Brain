import { ZodError } from "zod";

export const formatZodError = (error: ZodError<unknown>): string => {
  if (error.issues.length === 0) {
    return "Validation failed";
  }

  // Return the first error message for simplicity
  // You can modify this to return multiple errors if needed
  return error.issues[0].message;
};

export const formatZodErrors = (error: ZodError<unknown>): string[] => {
  return error.issues.map((err) => err.message);
};