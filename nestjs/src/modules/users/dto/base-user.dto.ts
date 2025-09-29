import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsDateString, IsIn, IsBoolean, IsNumber, IsPhoneNumber } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class BaseUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est obligatoire' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est obligatoire' })
  lastName: string;

  @IsString()
  @IsPhoneNumber('CM', { message: 'Numéro de téléphone invalide' })
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: Date;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country?: string = 'Cameroon';

  @IsString()
  @IsOptional()
  profession?: string;

  @IsIn(['admin', 'examiner', 'candidate'])
  @IsOptional()
  role?: UserRole;
}
