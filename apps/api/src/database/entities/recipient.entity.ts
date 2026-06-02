import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, Index,
} from 'typeorm';
import type { UserEntity } from './user.entity';

@Entity('recipients')
@Index(['userId', 'iban'], { unique: true })
export class RecipientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne('UserEntity')
  user: UserEntity;

  @Column()
  name: string;

  @Column()
  iban: string;

  @Column({ nullable: true })
  bic?: string;

  @Column({ nullable: true })
  bank?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ default: false })
  isFavorite: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
