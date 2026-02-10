import { IsString, MaxLength, IsOptional } from 'class-validator';

export class updateContractDto {
  @IsString()
  @IsOptional()
  objects?: string;

  @MaxLength(150)
  @IsString()
  @IsOptional()
  contractor?: string;
}
