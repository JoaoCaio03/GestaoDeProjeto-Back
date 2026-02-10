import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateAPostilleDto {
  @IsString()
  @IsOptional()
  supplierName: string;

  @Min(1)
  @Max(10)
  @IsInt()
  @IsOptional()
  orderApostille: number;
}
