import { Controller, Post, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Multer } from 'multer';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  async uploadDocument(@UploadedFile() file: Multer.File) {
    return this.documentsService.saveDocument(file);
  }
}
