import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { DocumentFilterDto } from './dto/document-filter.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}
  @Get()
  async findAll(@Query() filterDto: DocumentFilterDto) {
    const documents = await this.documentsService.findAll(filterDto);
    return documents;
  }
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.documentsService.findOne(id);
  }
  @Get(':id/view')
  async getViewUrl(@Param('id', ParseIntPipe) id: number) {
    return await this.documentsService.getViewUrl(id);
  }
}
