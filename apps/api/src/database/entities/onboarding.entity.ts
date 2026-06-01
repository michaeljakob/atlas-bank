import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from './user.entity';

export type OnboardingStatus =
  | 'initiated'
  | 'email_verified'
  | 'details_collected'
  | 'kyc_pending'
  | 'kyc_action_required'
  | 'kyc_verified'
  | 'kyc_rejected'
  | 'account_created'
  | 'completed';

@Entity('onboardings')
export class OnboardingEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @OneToOne(() => UserEntity, (user) => user.onboarding)
  @JoinColumn()
  user: UserEntity;

  @Column({ type: 'varchar', default: 'initiated' })
  status: OnboardingStatus;

  @Column({ nullable: true })
  providerOnboardingId?: string;

  @Column({ nullable: true })
  providerRedirectUrl?: string;

  @Column({ type: 'jsonb', nullable: true })
  providerMetadata?: Record<string, unknown>;

  @Column({ nullable: true })
  kycCompletedAt?: Date;

  @Column({ nullable: true })
  accountCreatedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
