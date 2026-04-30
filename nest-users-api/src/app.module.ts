import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma/prisma.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [UsersModule, PrismaModule, AuthModule, ThrottlerModule.forRoot([{
    ttl: 60000,     // time window in milliseconds (1 minute)
    limit: 1000,   // max requests per TTL
  }]),
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, { provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule { }
