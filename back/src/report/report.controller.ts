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
import { randomUUID } from 'crypto';
import { Express } from 'express';

import { ReportService } from './report.service';
import { CreateReportDto } from './dto/create-report.dto';
import {AuthGuard} from "@nestjs/passport";

// Types de preuves acceptés : le type MIME ET l'extension doivent être dans la liste
const ALLOWED_MIME = [
  'image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'video/mp4',
];
const ALLOWED_EXT = ['.png', '.jpg', '.jpeg', '.webp', '.pdf', '.mp4'];
const MAX_PROOF_SIZE = 5 * 1024 * 1024; // 5 Mo (Sonar S5693 : seuil max 8 Mo)

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
            // randomUUID : générateur cryptographique, nom imprévisible
            cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`);
          },
        }),
        limits: { fileSize: MAX_PROOF_SIZE, files: 1 },
        fileFilter: (_req, file, cb) => {
          const ext = extname(file.originalname).toLowerCase();
          if (!ALLOWED_MIME.includes(file.mimetype) || !ALLOWED_EXT.includes(ext)) {
            return cb(new BadRequestException('Type de fichier non autorisé'), false);
          }
          cb(null, true);
        },
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