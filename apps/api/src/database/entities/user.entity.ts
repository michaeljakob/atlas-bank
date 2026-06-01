import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { AccountEntity } from './account.entity';
import { OnboardingEntity } from './onboarding.entity';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  dateOfBirth: string;

  @Column()
  nationality: string;

  @Column()
  residenceCountry: string;

  @Column({ type: 'jsonb', nullable: true })
  residenceAddress?: {
    line1: string;
    line2?: string;
    city: string;
    postalCode: string;
    country: string;
  };

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @OneToOne(() => OnboardingEntity, (onboarding) => onboarding.user)
  onboarding?: OnboardingEntity;

  @OneToMany(() => AccountEntity, (account) => account.user)
  accounts?: AccountEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
