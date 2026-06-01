import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { AccountEntity } from './account.entity';

@Entity('cards')
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountId: string;

  @ManyToOne(() => AccountEntity, (account) => account.cards)
  account: AccountEntity;

  @Column()
  providerCardId: string;

  @Column({ type: 'varchar' })
  type: 'virtual' | 'physical';

  @Column({ type: 'varchar', default: 'active' })
  status: 'processing' | 'active' | 'frozen' | 'cancelled' | 'expired';

  @Column()
  last4: string;

  @Column()
  expiryMonth: number;

  @Column()
  expiryYear: number;

  @Column()
  cardholderName: string;

  @Column({ default: false })
  frozen: boolean;

  @Column({ default: true })
  onlineEnabled: boolean;

  @Column({ default: true })
  contactlessEnabled: boolean;

  @Column({ type: 'jsonb', nullable: true })
  spendingLimit?: { amount: number; period: string };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
