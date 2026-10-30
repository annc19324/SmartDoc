import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const successResponse = <T>(
  res: Response,
  data?: T,
  message: string = 'Success',
  statusCode: number = 200,
  pagination?: { page: number; limit: number; total: number; totalPages: number }
) => {
  const response: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(pagination && { pagination }),
  };
  return res.status(statusCode).json(response);
};

export const errorResponse = (
  res: Response,
  message: string = 'Internal Server Error',
  statusCode: number = 500,
  data: any = null
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    data,
  });
};
