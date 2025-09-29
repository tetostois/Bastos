import { IsString, MinLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  @ApiProperty({
    description: 'Token de réinitialisation reçu par email',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: 'Nouveau mot de passe (minimum 8 caractères)',
    minLength: 8,
    example: 'NouveauMotDePasse123!',
  })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
