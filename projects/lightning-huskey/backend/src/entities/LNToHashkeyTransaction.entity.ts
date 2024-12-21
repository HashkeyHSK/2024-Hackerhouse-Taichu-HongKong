import { Entity, Column } from 'typeorm';

// SQLITE Entity representing a transaction from Lightning Network to Hashkey Chain
@Entity()
export class LNToHashkeyTransaction {
  // Unique identifier for the transaction
  @Column({ primary: true, nullable: false })
  id?: string;

  // Lightning Network invoice ID
  @Column({ nullable: true })
  invoiceId?: string;

  // BOLT11 invoice string for Lightning Network payment
  @Column({ nullable: true })
  BOLT11?: string;

  // Destination Hashkey Chain address
  @Column({ nullable: false })
  hashkeyAddress?: string;

  // Transaction amount
  @Column({ nullable: false })
  amount?: string;

  // Lightning Network transaction status (Y/N/P/E)
  @Column({ nullable: false, default: 'N' })
  LNstatus?: string;

  // Hashkey Chain transaction status (Y/N/P)
  @Column({ nullable: false, default: 'N' })
  hashkeyStatus?: string;

  // Hashkey Chain transaction hash
  @Column({ nullable: true })
  hashkeyTx?: string;

  // Source network (L for Lightning Network)
  @Column({ nullable: false, default: 'L' })
  fromNetwork?: string;

  // Destination network (H for Hashkey Chain)
  @Column({ nullable: false, default: 'H' })
  toNetwork?: string;
}
