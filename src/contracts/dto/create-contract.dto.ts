import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDate,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Category, ContractStatus } from 'generated/prisma/enums';

export class CreateContractDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  contractNum: string;

  @IsString()
  @IsNotEmpty()
  objects: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  contractor: string;

  @IsNumber()
  @IsNotEmpty()
  contractValue: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  startDate: Date;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  endDate: Date;

  @IsEnum(ContractStatus)
  @IsOptional()
  status?: ContractStatus;

  @IsEnum(Category)
  @IsNotEmpty()
  category: Category;
}
