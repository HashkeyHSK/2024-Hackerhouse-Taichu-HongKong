/**
 * Main application module that configures and bootstraps the NestJS application
 *
 * Imports:
 * - ConfigModule: For environment variable configuration
 * - TypeOrmModule: For database connectivity using SQLite
 * - ScheduleModule: For running scheduled tasks
 * - LNToHashkeyTransactionModule: For handling Lightning Network to Hashkey Chain transactions
 */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AppController } from './app.controller';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';
import { InvoiceStatusUpdaterService } from './scheduler/invoiceStatusUpdater.service';
import { LNToHashkeyTransactionModule } from './lntohashkeyTransaction.module';

@Module({
  imports: [
    // Load environment variables from .env file
    ConfigModule.forRoot(),
    // Configure SQLite database connection
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_NAME || 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production', // Auto-sync DB schema in non-prod
    }),
    // Register LNToHashkeyTransaction entity
    TypeOrmModule.forFeature([LNToHashkeyTransaction]),
    // Enable scheduled tasks
    ScheduleModule.forRoot(),
    // Import transaction handling module
    LNToHashkeyTransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService, InvoiceStatusUpdaterService],
})
export class AppModule {}
