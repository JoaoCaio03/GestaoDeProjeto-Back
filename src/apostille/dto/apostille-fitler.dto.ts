import { IsInt, IsOptional, IsString } from 'class-validator';
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

  @IsString()
  @IsOptional()
  search?: string;
}
