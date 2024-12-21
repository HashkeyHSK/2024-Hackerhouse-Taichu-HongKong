import { Injectable, Global } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';
import { randomUUID } from 'crypto';

@Global()
@Injectable()
export class LNToHashkeyTransactionService {
  constructor(
    @InjectRepository(LNToHashkeyTransaction)
    private LNToHashkeyTransactionRepository: Repository<LNToHashkeyTransaction>,
  ) {}

  findAll(
    where?: FindOptionsWhere<LNToHashkeyTransaction>,
  ): Promise<LNToHashkeyTransaction[]> {
    return this.LNToHashkeyTransactionRepository.find(where ? { where } : {});
  }

  findOneInvoiceId(invoiceId: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionRepository.findOneBy({ invoiceId });
  }

  findOneById(id: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionRepository.findOneBy({ id });
  }

  updateLNStatus(id: string, LNstatus: string): Promise<UpdateResult> {
    return this.LNToHashkeyTransactionRepository.update(id, {
      LNstatus,
    });
  }

  updateHashkeyTx(id: string, hashkeyTx: string): Promise<UpdateResult> {
    return this.LNToHashkeyTransactionRepository.update(id, {
      hashkeyTx,
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

  async create(data: LNToHashkeyTransaction): Promise<string> {
    const id = randomUUID();

    await this.LNToHashkeyTransactionRepository.save({
      id,
      ...data,
    });

    return id;
  }

  // destory all data
  async destoryAll(): Promise<void> {
    await this.LNToHashkeyTransactionRepository.clear();
  }
}
