import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import type { AccountEntity } from './account.entity';
import type { OnboardingEntity } from './onboarding.entity';
import { encryptedColumn, encryptedJsonColumn } from '@/common/crypto/pii.transformer';

export type UserRole = 'user' | 'admin';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  // Access level. 'admin' unlocks the guarded /admin endpoints; everyone else
  // is a regular 'user'. Defaults to 'user' for all new sign-ups.
  @Column({ type: 'varchar', default: 'user' })
  role: UserRole;

  // Public payment handle (e.g. "michaeljakob"). Stored lowercase, unique, not
  // PII — used to send/request money without sharing an IBAN.
  @Column({ type: 'varchar', nullable: true, unique: true })
  handle?: string;

  @Column({ type: 'varchar', nullable: true, transformer: encryptedColumn })
  phone?: string;

  @Column({ type: 'varchar', transformer: encryptedColumn })
  firstName: string;

  @Column({ type: 'varchar', transformer: encryptedColumn })
  lastName: string;

  @Column({ type: 'varchar', transformer: encryptedColumn })
  dateOfBirth: string;

  @Column({ type: 'varchar', transformer: encryptedColumn })
  nationality: string;

  @Column({ type: 'varchar', transformer: encryptedColumn })
  residenceCountry: string;

  @Column({ type: 'text', nullable: true, transformer: encryptedJsonColumn })
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

  @OneToOne('OnboardingEntity', 'user')
  onboarding?: OnboardingEntity;

  @OneToMany('AccountEntity', 'user')
  accounts?: AccountEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
