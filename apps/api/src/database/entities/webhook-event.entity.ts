import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('webhook_events')
@Index(['providerEventId'], { unique: true })
export class WebhookEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  providerEventId: string;

  @Column()
  eventType: string;

  @Column({ nullable: true })
  resourceId?: string;

  @Column({ type: 'jsonb' })
  rawPayload: Record<string, unknown>;

  @Column({ type: 'varchar', default: 'received' })
  processingStatus: 'received' | 'processing' | 'processed' | 'failed';

  @Column({ nullable: true })
  processedAt?: Date;

  @Column({ nullable: true })
  errorMessage?: string;

  @CreateDateColumn()
  receivedAt: Date;
}
