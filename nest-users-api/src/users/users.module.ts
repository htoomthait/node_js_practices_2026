import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { LoggingProcessor } from './logging.processor';

@Module({
  imports: [
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    BullModule.registerQueue({
      name: 'user-queue',
    }),

  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, LoggingProcessor,]
})
export class UsersModule { }
