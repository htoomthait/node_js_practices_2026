
import { Injectable } from '@nestjs/common';



@Injectable()
export class AppConfig {
    port: number;
    databaseUrl: string;
    dotEnvFilePath: string;

    jwtAccessTokenSecret: string;
    jwtAccessTokenExpireAfter: string;
    jwtRefreshTokenSecret: string;
    jwtRefreshTokenExpireAfter: string;

    constructor() {
        this.port = Number(process.env.PORT) || 5400;
        this.databaseUrl = process.env.DATABASE_URL || '';
        this.dotEnvFilePath = process.env.DOT_ENV_FILE_PATH || '';

        this.jwtAccessTokenSecret = process.env.JWT_ACCESS_SECRET || '';
        this.jwtAccessTokenExpireAfter = process.env.JWT_ACCESS_TOKEN_EXPIRE || '1h'; // default to 1 hour
        this.jwtRefreshTokenSecret = process.env.JWT_REFRESH_SECRET || '';
        this.jwtRefreshTokenExpireAfter = process.env.JWT_REFRESH_TOKEN_EXPIRE || '7d'; // default to 7 days
    }




}    