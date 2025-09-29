import { IsString, IsOptional } from 'class-validator';
import { BaseUserDto } from './base-user.dto';

export class CreateAdminDto extends BaseUserDto {
  constructor() {
    super();
    this.role = 'admin';
  }

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  profession?: string;
}
