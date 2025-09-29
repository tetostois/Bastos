import { ApiProperty } from '@nestjs/swagger';

export class VerifyEmailResponseDto {
  @ApiProperty({
    description: 'Indique si la vérification a réussi',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Message détaillant le résultat de la vérification',
    example: 'Votre adresse email a été vérifiée avec succès !',
  })
  message: string;

  @ApiProperty({
    description: 'Indique si l\'utilisateur peut maintenant se connecter',
    example: true,
    required: false,
  })
  canLogin?: boolean;
}
