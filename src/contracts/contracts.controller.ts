import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  ParseIntPipe,
  BadRequestException,
  UseGuards,
  Query,
  Put,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { updateContractDto } from './dto/update-contract.dto';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { User } from 'generated/prisma/client';
import { JwtAuthGuard } from 'src/common/guards/auth.guard';
import { ContractFilterDto } from './dto/contract-filter.dto';

@UseGuards(JwtAuthGuard)
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'mainFile', maxCount: 1 },
      { name: 'ataFile', maxCount: 1 },
    ]),
  )
  async create(
    @UploadedFiles()
    files: {
      mainFile?: Express.Multer.File[];
      ataFile?: Express.Multer.File[];
    },
    @Body() createContractDto: CreateContractDto,
    @GetUser() user: User,
  ) {
    const mainFile = files?.mainFile?.[0];
    const ataFile = files?.ataFile?.[0];

    if (!mainFile || !ataFile) {
      throw new BadRequestException(
        'É obrigatório o envio do arquivo do Contrato e da Ata de Registro.',
      );
    }

    const maxSize = 1024 * 1024 * 20;
    if (mainFile.size > maxSize || ataFile.size > maxSize) {
      throw new BadRequestException('O tamanho máximo do arquivo é 20MB');
    }

    return await this.contractsService.create(
      createContractDto,
      {
        mainFile: mainFile,
        ataFile: ataFile,
      },
      user.idUser,
    );
  }

  @Get('summary')
  async getSummary() {
    return await this.contractsService.getSummary(); 
  }

  @Get()
  async findAll(@Query() contractFilterDto: ContractFilterDto) {
    return await this.contractsService.findAll(contractFilterDto);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.contractsService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: updateContractDto,
  ) {
    return await this.contractsService.update(id, updateDto);
  }
}
