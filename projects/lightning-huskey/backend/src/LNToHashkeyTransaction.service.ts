import { Injectable, Global } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository, UpdateResult } from 'typeorm';
import { LNToHashkeyTransaction } from './entities/LNToHashkeyTransaction.entity';
import { randomUUID } from 'crypto';

/**
 * Service for managing Lightning Network to Hashkey Chain transactions
 */
@Global()
@Injectable()
export class LNToHashkeyTransactionService {
  constructor(
    @InjectRepository(LNToHashkeyTransaction)
    private LNToHashkeyTransactionRepository: Repository<LNToHashkeyTransaction>,
  ) {}

  /**
   * Find all transactions matching optional where conditions
   * @param where Optional where conditions to filter results
   * @returns Promise resolving to array of matching transactions
   */
  findAll(
    where?: FindOptionsWhere<LNToHashkeyTransaction>,
  ): Promise<LNToHashkeyTransaction[]> {
    return this.LNToHashkeyTransactionRepository.find(where ? { where } : {});
  }

  /**
   * Find a single transaction matching where conditions
   * @param where Where conditions to match
   * @returns Promise resolving to matching transaction
   */
  findOne(
    where: FindOptionsWhere<LNToHashkeyTransaction>,
  ): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionRepository.findOneBy(where);
  }

  /**
   * Find a transaction by invoice ID
   * @param invoiceId Invoice ID to search for
   * @returns Promise resolving to matching transaction
   */
  findOneInvoiceId(invoiceId: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionRepository.findOneBy({ invoiceId });
  }

  /**
   * Find a transaction by ID
   * @param id Transaction ID to search for
   * @returns Promise resolving to matching transaction
   */
  findOneById(id: string): Promise<LNToHashkeyTransaction> {
    return this.LNToHashkeyTransactionRepository.findOneBy({ id });
  }

  /**
   * Update a transaction by ID
   * @param id ID of transaction to update
   * @param data Updated transaction data
   * @returns Promise resolving to update result
   */
  update(id: string, data: LNToHashkeyTransaction): Promise<UpdateResult> {
    return this.LNToHashkeyTransactionRepository.update(id, data);
  }

  /**
   * Remove a transaction by invoice ID
   * @param invoiceId Invoice ID of transaction to remove
   */
  async remove(invoiceId: string): Promise<void> {
    await this.LNToHashkeyTransactionRepository.delete(invoiceId);
  }

  /**
   * Create a new transaction
   * @param data Transaction data to create
   * @returns Promise resolving to created transaction ID
   */
  async create(data: LNToHashkeyTransaction): Promise<string> {
    const id = randomUUID();

    await this.LNToHashkeyTransactionRepository.save({
      id,
      ...data,
    });

    return id;
  }

  /**
   * Delete all transactions from the database
   */
  async destoryAll(): Promise<void> {
    await this.LNToHashkeyTransactionRepository.clear();
  }
}
