import { Injectable, Global } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';

@Global()
@Injectable()
export class LNToHashkeyTransactionService {
  constructor(
    @InjectRepository(LNToHashkeyTransaction)
    private LNToHashkeyTransactionRepository: Repository<LNToHashkeyTransaction>,
  ) {}

  findAll(
    where: FindOptionsWhere<LNToHashkeyTransaction>,
  ): Promise<LNToHashkeyTransaction[]> {
    return this.LNToHashkeyTransactionRepository.find({ where });
  }

  findOne(invoiceId: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionRepository.findOneBy({ invoiceId });
  }

  updateLNStatus(invoiceId: string, LNstatus: string): Promise<UpdateResult> {
    return this.LNToHashkeyTransactionRepository.update(invoiceId, {
      LNstatus,
    });
  }

  updateHashkeyStatus(
    invoiceId: string,
    hashkeyStatus: string,
  ): Promise<UpdateResult> {
    return this.LNToHashkeyTransactionRepository.update(invoiceId, {
      hashkeyStatus,
    });
  }

  async remove(invoiceId: string): Promise<void> {
    await this.LNToHashkeyTransactionRepository.delete(invoiceId);
  }

  async create(
    invoiceId: string,
    BOLT11: string,
    hashkeyAddress: string,
    amount: string,
  ): Promise<void> {
    await this.LNToHashkeyTransactionRepository.save({
      invoiceId,
      BOLT11,
      hashkeyAddress,
      amount,
    });
  }
}
