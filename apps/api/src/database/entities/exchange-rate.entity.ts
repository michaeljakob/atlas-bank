import {
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index,
} from 'typeorm';

@Entity('exchange_rates')
@Index(['baseCurrency', 'targetCurrency'])
export class ExchangeRateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  baseCurrency: string;

  @Column()
  targetCurrency: string;

  @Column({ type: 'decimal', precision: 12, scale: 6 })
  rate: number;

  @CreateDateColumn()
  fetchedAt: Date;
}
