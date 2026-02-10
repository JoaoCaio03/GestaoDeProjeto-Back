import {
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsDateString,
  IsEnum,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AdditiveType } from 'generated/prisma/enums';
export class CreateAdditiveDto {
  @IsEnum(AdditiveType, { message: 'Tipo de aditivo inválido' })
  @IsNotEmpty()
  typeAdditive: AdditiveType;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  valueChange?: number;

  @IsDateString()
  @IsOptional()
  newEndDate?: string;

  @IsDateString()
  @IsNotEmpty()
  dateSigned: string;

  @IsInt()
  @IsNotEmpty()
  @Type(() => Number)
  idContract: number;
}
