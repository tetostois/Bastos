import { ApiProperty } from '@nestjs/swagger';

export class UserProfileResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  firstName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  lastName: string;

  @ApiProperty({
    description: 'Phone number of the user',
    example: '+237123456789',
  })
  phone: string;

  @ApiProperty({
    description: 'Address of the user',
    example: '123 Main Street',
    required: false,
  })
  address?: string;

  @ApiProperty({
    description: 'Date of birth of the user',
    example: '1990-01-01',
    required: false,
  })
  birthDate?: string;

  @ApiProperty({
    description: 'Place of birth of the user',
    example: 'Yaoundé',
    required: false,
  })
  birthPlace?: string;

  @ApiProperty({
    description: 'City of residence',
    example: 'Douala',
    required: false,
  })
  city?: string;

  @ApiProperty({
    description: 'Country of residence',
    example: 'Cameroon',
    default: 'Cameroon',
  })
  country: string;

  @ApiProperty({
    description: 'Profession of the user',
    example: 'Software Developer',
    required: false,
  })
  profession?: string;

  @ApiProperty({
    description: 'Role of the user in the system',
    enum: ['admin', 'examiner', 'candidate'],
    example: 'candidate',
  })
  role: string;

  @ApiProperty({
    description: 'Whether the user has paid for the certification',
    default: false,
  })
  hasPaid: boolean;

  @ApiProperty({
    description: 'Whether the user has taken the exam',
    default: false,
  })
  examTaken: boolean;

  @ApiProperty({
    description: 'User\'s score on the exam',
    required: false,
    example: 85.5,
  })
  score?: number;

  @ApiProperty({
    description: 'User\'s level (for candidates)',
    enum: ['debutant', 'intermediaire', 'expert'],
    example: 'debutant',
    required: false,
  })
  level?: string;

  @ApiProperty({
    description: 'Date when the user was created',
    example: '2023-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Date when the user was last updated',
    example: '2023-01-01T00:00:00.000Z',
  })
  updatedAt: Date;
}
