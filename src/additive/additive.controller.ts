import {
  Body,
  Controller,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdditiveService } from './additive.service';
import { CreateAdditiveDto } from './dto/create-additive.dto';
import { UpdateAdditiveDto } from './dto/update-additive.dto';
import { AdditiveFilterDto } from './dto/additive-filter.dto';

@Controller('additive')
export class AdditiveController {
  constructor(private readonly additiveService: AdditiveService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createAdditiveDto: CreateAdditiveDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.additiveService.create(createAdditiveDto, file);
  }

  @Get()
  async findAll(@Query() filterDto: AdditiveFilterDto) {
    return this.additiveService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.additiveService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAdditiveDto: UpdateAdditiveDto,
  ) {
    return await this.additiveService.update(id, updateAdditiveDto);
  }
}
