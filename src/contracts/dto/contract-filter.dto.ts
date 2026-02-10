import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ContractDateFilter } from 'src/common/enums/contract-filter.enum';
import { ContractStatus } from 'generated/prisma/enums';
import { CursorPaginationDto } from 'src/common/dtos/pagination.dto';

export class ContractFilterDto extends CursorPaginationDto {
  @IsOptional()
  @IsEnum(ContractStatus)
  status?: ContractStatus;

  @IsOptional()
  @IsEnum(ContractDateFilter)
  dateFilter?: ContractDateFilter;

  @IsString()
  @IsOptional()
  search?: string;
}
