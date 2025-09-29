import { IsOptional, IsString, ValidateIf } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class CreateCandidateDto extends BaseUserDto {
  constructor() {
    super();
    this.role = 'candidate';
  }

  @IsString()
  @IsOptional()
  @ValidateIf(o => o.phone)
  phone: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  birthPlace?: string;

  @IsString()
  @IsOptional()
  city?: string;
}
