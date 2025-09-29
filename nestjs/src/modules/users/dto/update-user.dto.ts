import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsBoolean, IsNumber, IsString, IsEmail, IsPhoneNumber, IsIn } from 'class-validator';
import { BaseUserDto } from './base-user.dto';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto extends PartialType(BaseUserDto) {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  password?: string;

  // Champs spécifiques aux examinateurs
  @IsString()
  @IsOptional()
  specialization?: string;

  @IsNumber()
  @IsOptional()
  yearsOfExperience?: number;

  // Champs de statut
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  emailVerified?: boolean;

  // Champs pour les candidats
  @IsBoolean()
  @IsOptional()
  hasPaid?: boolean;

  @IsBoolean()
  @IsOptional()
  examTaken?: boolean;

  @IsNumber()
  @IsOptional()
  score?: number;

  @IsString()
  @IsOptional()
  certificate?: string;

  @IsString()
  @IsOptional()
  selectedCertification?: string;

  @IsString({ each: true })
  @IsOptional()
  completedModules?: string[];

  // Champs pour la vérification et la réinitialisation
  @IsString()
  @IsOptional()
  verificationToken?: string;

  @IsOptional()
  verificationTokenExpires?: Date;

  @IsString()
  @IsOptional()
  passwordResetToken?: string;

  @IsOptional()
  passwordResetExpires?: Date;

  @IsOptional()
  currentModule?: string;

  @IsOptional()
  examStartDate?: Date;

  @IsOptional()
  specialization?: string;

  @IsOptional()
  experience?: string;
}
