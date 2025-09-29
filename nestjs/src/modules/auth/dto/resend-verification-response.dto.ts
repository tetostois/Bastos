import { ApiProperty } from '@nestjs/swagger';

export class ResendVerificationResponseDto {
  @ApiProperty({
    description: 'Indique si la demande a été traitée avec succès',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Message détaillant le résultat de la demande',
    example: 'Un nouvel email de vérification a été envoyé à votre adresse email.',
  })
  message: string;
}
