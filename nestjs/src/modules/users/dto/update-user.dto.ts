import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  hasPaid?: boolean;

  @IsOptional()
  @IsBoolean()
  examTaken?: boolean;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  certificate?: string;

  @IsOptional()
  selectedCertification?: string;

  @IsOptional()
  completedModules?: string[];

  @IsOptional()
  currentModule?: string;

  @IsOptional()
  examStartDate?: Date;

  @IsOptional()
  specialization?: string;

  @IsOptional()
  experience?: string;
}
