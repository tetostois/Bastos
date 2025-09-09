import { IsEmail, IsNotEmpty, IsString, MinLength, IsIn, IsOptional, IsPhoneNumber, IsDateString } from 'class-validator';

export type UserLevel = 'debutant' | 'intermediaire' | 'expert';

export class RegisterDto {
  @IsEmail()
  @IsNotEmpty({ message: "L'email est requis" })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'Le nom est requis' })
  lastName: string;

  @IsString()
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  @IsPhoneNumber('CM', { message: 'Numéro de téléphone invalide' })
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  country: string = 'Cameroun';

  @IsString()
  @IsOptional()
  profession?: string;

  @IsIn(['debutant', 'intermediaire', 'expert'])
  @IsNotEmpty({ message: 'Le niveau est requis' })
  level: UserLevel;

  // Champ non visible dans le formulaire, défini par défaut
  role: 'candidate' = 'candidate';
  
  // Champs avec valeurs par défaut
  isActive: boolean = true;
  hasPaid: boolean = false;
  examTaken: boolean = false;
}
