/**
 * Module for handling transactions between Lightning Network and Hashkey Chain
 *
 * Imports:
 * - TypeOrmModule: Registers LNToHashkeyTransaction entity for database operations
 *
 * Providers:
 * - LNToHashkeyTransactionService: Service for managing cross-chain transactions
 *
 * Exports:
 * - LNToHashkeyTransactionService: Makes the service available to other modules
 */
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
