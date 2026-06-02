import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import type { UserEntity } from './user.entity';
import type { CardEntity } from './card.entity';
import type { TransactionEntity } from './transaction.entity';

@Entity('accounts')
export class AccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne('UserEntity', 'accounts')
  user: UserEntity;

  @Column()
  providerAccountId: string;

  @Column({ type: 'varchar', default: 'active' })
  status: 'opening' | 'active' | 'suspended' | 'closed';

  @Column()
  iban: string;

  @Column()
  bic: string;

  @Column()
  holderName: string;

  @Column({ type: 'bigint', default: 0 })
  balanceCents: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ nullable: true })
  lastReconciledAt?: Date;

  @OneToMany('CardEntity', 'account')
  cards?: CardEntity[];

  @OneToMany('TransactionEntity', 'account')
  transactions?: TransactionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
