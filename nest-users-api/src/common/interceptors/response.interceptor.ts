// common/interceptors/response.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const response = context.switchToHttp().getResponse();

        return next.handle().pipe(
            map((data) => {
                // If the data returned has a statusCode, apply it to the header
                if (data && data.statusCode) {
                    response.status(data.statusCode);
                }
                return data;
            }),
        );
    }
}