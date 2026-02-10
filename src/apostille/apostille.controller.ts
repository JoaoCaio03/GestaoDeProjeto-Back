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
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateApostilleDto } from './dto/create-apostille.dto';
import { ApostilleService } from './apostille.service';
import { UpdateAPostilleDto } from './dto/update-apostille.dto';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ApostilleFilterDto } from './dto/apostille-fitler.dto';

@UseGuards(JwtAuthGuard)
@Controller('apostille')
export class ApostilleController {
  constructor(private readonly apostilleService: ApostilleService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createApostilleDto: CreateApostilleDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 20 * 1024 * 1024 })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return await this.apostilleService.create(createApostilleDto, file);
  }

  @Get()
  async findAll(@Query() filterDto: ApostilleFilterDto) {
    return this.apostilleService.findAll(filterDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.apostilleService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateApostilleDto: UpdateAPostilleDto,
  ) {
    return await this.apostilleService.update(id, updateApostilleDto);
  }
}
