import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import 'dotenv/config';


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {

    private readonly logger = new Logger(PrismaService.name);

    constructor() {
        const databaseUrl = process.env.DATABASE_URL;
        const parsedUrl = databaseUrl ? new URL(databaseUrl) : undefined;

        super({
            adapter: new PrismaMariaDb({
                host: parsedUrl?.hostname ?? 'localhost',
                port: Number(parsedUrl?.port ?? 3306),
                user: parsedUrl?.username,
                password: parsedUrl?.password,
                database: parsedUrl?.pathname?.slice(1),
            }),
        });
    }

    async onModuleInit() {
        try {
            await this.$connect();
            // Using a simple log instead of logger for brevity
            this.logger.log('Successfully connected to the database');
        } catch (error) {
            this.logger.error('Failed to connect to the database', error);
        }
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
