import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index,
} from 'typeorm';
import type { UserEntity } from './user.entity';

@Entity('payment_requests')
@Index(['token'], { unique: true })
export class PaymentRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne('UserEntity')
  user: UserEntity;

  @Column({ type: 'bigint' })
  amountCents: number;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ nullable: true })
  recipientEmail?: string;

  @Column({ nullable: true })
  note?: string;

  @Column({ type: 'varchar', default: 'pending' })
  status: 'pending' | 'paid' | 'expired' | 'cancelled';

  @Column({ unique: true })
  token: string;

  @Column({ nullable: true })
  expiresAt?: Date;

  @Column({ nullable: true })
  paidAt?: Date;

  @Column({ nullable: true })
  paidByName?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
