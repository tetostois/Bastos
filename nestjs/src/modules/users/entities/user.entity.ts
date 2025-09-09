import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

export type UserRole = 'admin' | 'examiner' | 'candidate';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  birthDate: Date;

  @Column({ nullable: true })
  birthPlace: string;

  @Column({ nullable: true })
  city: string;

  @Column({ default: 'Cameroon' })
  country: string;

  @Column({ nullable: true })
  profession: string;

  @Column({
    type: 'enum',
    enum: ['admin', 'examiner', 'candidate'],
    default: 'candidate',
  })
  role: UserRole;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  hasPaid: boolean;

  @Column({ default: false })
  examTaken: boolean;

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ nullable: true })
  certificate: string;

  @Column({ nullable: true })
  selectedCertification: string;

  @Column('simple-array', { nullable: true })
  completedModules: string[];

  @Column({ nullable: true })
  currentModule: string;

  @Column({ type: 'timestamp', nullable: true })
  examStartDate: Date;

  @Column({ nullable: true })
  specialization: string;

  @Column({ type: 'text', nullable: true })
  experience: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }

  async comparePassword(attempt: string): Promise<boolean> {
    return bcrypt.compare(attempt, this.password);
  }
}
