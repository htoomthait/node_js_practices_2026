import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { BullModule } from '@nestjs/bullmq';
import { LoggingProcessor } from './jobs/logging.processor';
import { UserExportCsvProcessor } from './jobs/user-export-csv.processor';

@Module({
  imports: [
    AuthModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    BullModule.registerQueue({
      name: 'user-queue',
    }, { name: 'export-users-csv' }),

  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, LoggingProcessor, UserExportCsvProcessor]
})
export class UsersModule { }
