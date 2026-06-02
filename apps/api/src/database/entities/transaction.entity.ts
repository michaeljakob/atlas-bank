import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import type { AccountEntity } from './account.entity';

@Entity('transactions')
@Index(['accountId', 'createdAt'])
@Index(['cardId', 'createdAt'])
export class TransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountId: string;

  @ManyToOne('AccountEntity', 'transactions')
  account: AccountEntity;

  @Column({ type: 'uuid', nullable: true })
  cardId?: string | null;

  @Column()
  providerTransactionId: string;

  @Column({ type: 'varchar' })
  direction: 'inbound' | 'outbound';

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'settled' | 'rejected' | 'cancelled';

  @Column({ type: 'bigint' })
  amountCents: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column()
  counterpartyName: string;

  @Column({ nullable: true })
  counterpartyIban?: string;

  @Column({ nullable: true })
  reference?: string;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  bookedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;
}
