import { Entity, Column } from 'typeorm';

@Entity()
export class LNToHashkeyTransaction {
  @Column({ primary: true, nullable: false })
  id?: string;

  @Column({ nullable: true })
  invoiceId?: string;

  @Column({ nullable: true })
  BOLT11?: string;

  @Column({ nullable: false })
  hashkeyAddress?: string;

  @Column({ nullable: false })
  amount?: string;

  @Column({ nullable: false, default: 'N' })
  LNstatus?: string;

  @Column({ nullable: false, default: 'N' })
  hashkeyStatus?: string;

  @Column({ nullable: true })
  hashkeyTx?: string;

  @Column({ nullable: false, default: 'L' })
  fromNetwork?: string;

  @Column({ nullable: false, default: 'H' })
  toNetwork?: string;
}
