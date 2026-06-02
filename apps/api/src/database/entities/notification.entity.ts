import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Index,
} from 'typeorm';
import type { UserEntity } from './user.entity';

@Entity('notifications')
@Index(['userId', 'createdAt'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne('UserEntity')
  user: UserEntity;

  @Column()
  type: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ default: false })
  read: boolean;

  @Column({ type: 'simple-json', nullable: true })
  metadata?: Record<string, unknown>;

  @CreateDateColumn()
  createdAt: Date;
}
