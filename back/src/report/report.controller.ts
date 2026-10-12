import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Body,

  BadRequestException, Put, Param, ParseIntPipe, Query, UseGuards,

} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';

import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import {AuthGuard} from "@nestjs/passport";

@Controller('reports')
@UseGuards(AuthGuard('jwt'))
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @Post()
  @UseInterceptors(
      FileInterceptor('proof', {
        storage: diskStorage({
          destination: './uploads/proofs',
          filename: (_req, file, cb) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            cb(null, `${uniqueSuffix}${extname(file.originalname)}`);
          },
        }),
      }),
  )

  async createReport(
      @UploadedFile() file: Express.Multer.File,
      @Body() createReportDto: CreateReportDto,
  ) {
    const proofPath = file ? file.path : null;

    return this.reportService.createReport(createReportDto, proofPath);
  }
  @Put(':id')
  async handleAction(
      @Param('id', ParseIntPipe) id: number,
      @Query('action') action: 'approve' | 'decline'
  ) {
    if (action === 'approve') {

      return this.reportService.approve(id);
    }
    if (action === 'decline') {
      return this.reportService.decline(id);
    }
    if (action === 'delete') {
        return this.reportService.remove(id);
    }
    throw new BadRequestException(`Invalid action "${action}"`);
  }
}