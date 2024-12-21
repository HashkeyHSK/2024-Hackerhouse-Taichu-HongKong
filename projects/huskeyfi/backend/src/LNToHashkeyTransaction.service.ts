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

  findOne(
    where: FindOptionsWhere<LNToHashkeyTransaction>,
  ): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionRepository.findOneBy(where);
  }

  findOneInvoiceId(invoiceId: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionRepository.findOneBy({ invoiceId });
  }

  findOneById(id: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionRepository.findOneBy({ id });
  }

  update(id: string, data: LNToHashkeyTransaction): Promise<UpdateResult> {
    return this.LNToHashkeyTransactionRepository.update(id, data);
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
