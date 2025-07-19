import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpStatus,
    HttpException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            switch (exception.code) {
                case 'P2002': {
                    // Unique constraint failed (ví dụ: email đã tồn tại)
                    const target = (exception.meta?.target as string[]);
                    response.status(HttpStatus.CONFLICT).json({
                        message: `${target} already exists`,
                        error: 'Conflict',
                        statusCode: HttpStatus.CONFLICT,
                    });
                    break;
                }

                case 'P2025': {
                    // Record not found
                    response.status(HttpStatus.NOT_FOUND).json({
                        message: 'Record not found',
                        error: 'Not Found',
                        statusCode: HttpStatus.NOT_FOUND,
                    });
                    break;
                }

                case 'P2003': {
                    // Foreign key constraint failed
                    response.status(HttpStatus.BAD_REQUEST).json({
                        message: 'Foreign key constraint failed',
                        error: 'Bad Request',
                        statusCode: HttpStatus.BAD_REQUEST,
                    });
                    break;
                }

                default: {
                    // Lỗi Prisma khác chưa định nghĩa
                    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                        message: exception.message,
                        error: 'Internal Server Error',
                        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                    });
                    break;
                }
            }
        }
        else if (exception instanceof HttpException) {
            const status = exception.getStatus();
            const res = exception.getResponse();

            let message: string | string[] = 'Unexpected error';
            let error: string = HttpStatus[status] ?? 'Error';

            if (typeof res === 'string') {
                
                message = res;
            } else if (typeof res === 'object' && res !== null) {
               
                const r = res as Record<string, any>;
                message = r.message ?? message;
                error = r.error ?? error;
            }

            response.status(status).json({
                message,
                error,
                statusCode: status,
            });
        }
    }
}
