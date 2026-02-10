import { IsEnum, IsOptional, IsString } from 'class-validator';
import { DocType } from 'generated/prisma/enums';
import { CursorPaginationDto } from 'src/common/dtos/pagination.dto';

export class DocumentFilterDto extends CursorPaginationDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(DocType)
  docType?: DocType;
}
