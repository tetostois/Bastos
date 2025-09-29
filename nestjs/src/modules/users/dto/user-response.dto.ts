import { Exclude, Expose, Type } from 'class-transformer';
import { UserRole } from '../entities/user.entity';

export class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  firstName: string;

  @Expose()
  lastName: string;

  @Expose()
  phone?: string;

  @Expose()
  address?: string;

  @Expose({ name: 'birthDate' })
  @Type(() => String)
  getBirthDate() {
    return this.birthDate?.toISOString().split('T')[0];
  }
  birthDate: Date;

  @Expose()
  birthPlace?: string;

  @Expose()
  city?: string;

  @Expose()
  country: string = 'Cameroon';

  @Expose()
  profession?: string;

  @Expose()
  role: UserRole;

  // Champs spécifiques aux examinateurs
  @Expose()
  specialization?: string;

  @Expose()
  yearsOfExperience?: number;

  // Champs de statut
  @Expose()
  isActive: boolean;

  @Expose()
  emailVerified: boolean;

  // Champs pour les candidats
  @Expose()
  hasPaid?: boolean;

  @Expose()
  examTaken?: boolean;

  @Expose()
  score?: number;

  @Expose()
  certificate?: string;

  @Expose()
  selectedCertification?: string;

  @Expose()
  completedModules?: string[];

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  password: string;

  @Exclude()
  verificationToken?: string;

  @Exclude()
  verificationTokenExpires?: Date;

  @Exclude()
  passwordResetToken?: string;

  @Exclude()
  passwordResetExpires?: Date;

  constructor(partial: Partial<UserResponseDto>) {
    Object.assign(this, partial);
  }
}
