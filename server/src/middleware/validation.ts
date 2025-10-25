import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
<<<<<<< HEAD
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
=======
  console.log('🔍 [DEBUG] Validation middleware called');
  console.log('🔍 [DEBUG] Request body:', JSON.stringify(req.body, null, 2));
  
  const errors = validationResult(req);
  console.log('🔍 [DEBUG] Validation errors:', errors.array());
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg);
    console.log('❌ [DEBUG] Validation failed with errors:', errorMessages);
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
    return;
  }
  
<<<<<<< HEAD
=======
  console.log('✅ [DEBUG] Validation passed, proceeding to controller');
>>>>>>> 473e7d7e366c2b4e682081de45b4866d6d40b237
  next();
};
