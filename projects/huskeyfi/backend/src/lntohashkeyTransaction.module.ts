// src/lntohashkey-transaction.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LNToHashkeyTransactionService } from './LNToHashkeyTransaction.service';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LNToHashkeyTransaction])],
  providers: [LNToHashkeyTransactionService],
  exports: [LNToHashkeyTransactionService],
})
export class LNToHashkeyTransactionModule {}
