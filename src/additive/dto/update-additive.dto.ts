import { IsOptional, IsString } from 'class-validator';

export class UpdateAdditiveDto {
  @IsString()
  @IsOptional()
  description: string;
}
