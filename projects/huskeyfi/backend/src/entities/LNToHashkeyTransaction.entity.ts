import { Entity, Column } from 'typeorm';

@Entity()
export class LNToHashkeyTransaction {
  @Column({ primary: true, nullable: false })
  invoiceId: string;

  @Column({ nullable: false })
  BOLT11: string;

  @Column({ nullable: false })
  hashkeyAddress: string;

  @Column({ nullable: false })
  amount: string;

  @Column({ nullable: false, default: 'N' })
  LNstatus: string;

  @Column({ nullable: false, default: 'N' })
  hashkeyStatus: string;
}
