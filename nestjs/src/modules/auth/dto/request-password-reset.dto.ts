import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestPasswordResetDto {
  @ApiProperty({
    description: 'Adresse email du compte pour la réinitialisation du mot de passe',
    example: 'utilisateur@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
