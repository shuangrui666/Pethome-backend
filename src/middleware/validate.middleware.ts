import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    console.log('=== 验证中间件开始 ===');
    console.log('验证规则数量:', validations.length);
    console.log('请求体:', req.body);
    await Promise.all(validations.map(validation => validation.run(req)));
    console.log('验证规则执行完成');

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map((err: any) => ({
      field: err.path,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: '验证失败',
      errors: extractedErrors
    });
  };
};
