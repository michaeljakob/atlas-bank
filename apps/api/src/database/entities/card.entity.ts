import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import type { AccountEntity } from './account.entity';

@Entity('cards')
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accountId: string;

  @ManyToOne('AccountEntity', 'cards')
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

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', default: 'black' })
  color: 'black' | 'white' | 'green';

  @Column({ default: false })
  frozen: boolean;

  @Column({ default: true })
  onlineEnabled: boolean;

  @Column({ default: true })
  contactlessEnabled: boolean;

  @Column({ default: false })
  atmEnabled: boolean;

  @Column({ default: true })
  internationalEnabled: boolean;

  @Column({ type: 'simple-json', nullable: true })
  spendingLimit?: { daily?: number; monthly?: number };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
