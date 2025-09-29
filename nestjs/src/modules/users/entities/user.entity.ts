import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate } from 'typeorm';
import * as bcrypt from 'bcrypt';

export type UserRole = 'admin' | 'examiner' | 'candidate';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  password: string;

  @Column({ name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ type: 'date', name: 'birth_date', nullable: true })
  birthDate: Date;

  @Column({ name: 'birth_place', nullable: true })
  birthPlace: string;

  @Column({ nullable: true })
  city: string;

  @Column({ default: 'Cameroon' })
  country: string;

  @Column({ nullable: true })
  profession: string;

  // Champs spécifiques aux examinateurs
  @Column({ name: 'specialization', nullable: true })
  specialization: string;

  @Column({ name: 'years_of_experience', type: 'int', nullable: true })
  yearsOfExperience: number;

  @Column({
    type: 'enum',
    enum: ['admin', 'examiner', 'candidate'],
    default: 'candidate',
  })
  role: UserRole;

  // Champs pour la vérification d'email
  @Column({ name: 'email_verified', default: false })
  emailVerified: boolean;

  @Column({ name: 'verification_token', nullable: true, select: false })
  verificationToken: string;

  @Column({ name: 'verification_token_expires', type: 'timestamp', nullable: true })
  verificationTokenExpires: Date;

  // Champs pour la réinitialisation du mot de passe
  @Column({ name: 'password_reset_token', nullable: true, select: false })
  passwordResetToken: string;

  @Column({ name: 'password_reset_expires', type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password) {
      const saltRounds = 10;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

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
