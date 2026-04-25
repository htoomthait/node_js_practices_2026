import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        super();
    }

    async onModuleInit() {
        await this.$connect(); // Establish the connection to the database
    }

    async onModuleDestroy() {
        await this.$disconnect(); // Clean up the connection when the application shuts down
    }
}
