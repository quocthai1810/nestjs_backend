import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class AuthResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        if (Array.isArray(data)) {
          return data.map((item) => {
            delete item?.user.password;
            delete item?.user.refreshToken;
            return item;
          });
        }

        if (typeof data === 'object' && data !== null) {
          delete data.user.password;
          delete data.user.refreshToken;
        }

        return data;
      }),
    );
  }
}
