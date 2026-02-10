import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateApostilleDto {
  @IsString()
  @IsNotEmpty()
  supplierName: string;

  @Min(1)
  @Max(10)
  @IsInt()
  @Type(() => Number)
  orderApostille: number;

  @IsDateString()
  dateApostille: string;

  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  idContract: number;
}
