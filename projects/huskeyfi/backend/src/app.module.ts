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
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.DATABASE_NAME || 'database.sqlite',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    TypeOrmModule.forFeature([LNToHashkeyTransaction]),
    ScheduleModule.forRoot(),
    LNToHashkeyTransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService, InvoiceStatusUpdaterService],
})
export class AppModule {}
