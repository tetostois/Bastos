import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendVerificationDto {
  @ApiProperty({
    example: 'utilisateur@example.com',
    description: 'Adresse email à laquelle renvoyer l\'email de vérification',
  })
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  @IsNotEmpty({ message: 'L\'adresse email est requise' })
  email: string;
}