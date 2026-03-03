import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CursorPaginationDto } from 'src/common/dtos/pagination.dto';

export class ApostilleFilterDto extends CursorPaginationDto {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  idContract?: number;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @Min(1)
  @Max(10)
  @IsInt()
  @Type(() => Number)
  orderApostille?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
