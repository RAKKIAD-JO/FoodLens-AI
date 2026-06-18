import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { AppError } from './error.middleware.js';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(
          new AppError(
            'Validation Error',
            400,
            error.errors.map((err) => ({
              field: err.path.slice(1).join('.'), // Remove 'body', 'query', etc.
              message: err.message,
            }))
          )
        );
        return;
      }
      next(error);
    }
  };
};
