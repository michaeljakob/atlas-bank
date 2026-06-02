import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import type { UserEntity } from './user.entity';

/**
 * A Jar is a named savings pot scoped to a single currency. Money in a jar is
 * ring-fenced from the spendable balance of its currency hub account, letting
 * users set money aside for goals (e.g. "Holiday", "Rent"). Each jar belongs to
 * exactly one currency; the matching currency account is its funding hub.
 */
@Entity('jars')
@Index(['userId', 'currency'])
export class JarEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne('UserEntity')
  user: UserEntity;

  @Column()
  name: string;

  @Column({ default: 'EUR' })
  currency: string;

  @Column({ type: 'bigint', default: 0 })
  balanceCents: number;

  @Column({ type: 'bigint', nullable: true })
  targetCents?: number | null;

  @Column({ nullable: true })
  emoji?: string;

  @Column({ nullable: true })
  color?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
