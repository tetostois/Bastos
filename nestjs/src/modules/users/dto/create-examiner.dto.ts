import { IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class CreateExaminerDto extends BaseUserDto {
  constructor() {
    super();
    this.role = 'examiner';
  }

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  specialization?: string;

  @IsNumber()
  @Min(0)
  @Max(50)
  @IsOptional()
  yearsOfExperience?: number;
}
