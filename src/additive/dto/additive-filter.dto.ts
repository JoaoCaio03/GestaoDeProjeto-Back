import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { AdditiveType } from 'generated/prisma/enums';
import { CursorPaginationDto } from 'src/common/dtos/pagination.dto';

export class AdditiveFilterDto extends CursorPaginationDto {
  @IsOptional()
  @IsEnum(AdditiveType)
  typeAdditive?: AdditiveType;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  idContract?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
