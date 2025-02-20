import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Get, Delete, Param, Put } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Multer } from 'multer';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
   @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('editor', 'admin')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 1 * 1024 * 1024 } })) // 1 MB limit
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a document' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async uploadDocument(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }
    return this.documentsService.saveDocument(file);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('editor', 'admin', 'viewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all documents' })
  @ApiResponse({ status: 200, description: 'Documents retrieved successfully.' })
  async getAllDocuments() {
    return this.documentsService.findAllWithUser();
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('editor', 'admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a document' })
  @ApiResponse({ status: 200, description: 'Document deleted successfully.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  async deleteDocument(@Param('id') id: string) {
    return this.documentsService.softDeleteDocument(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('editor', 'admin')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 1 * 1024 * 1024 } })) // 1 MB limit
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  async updateDocument(@Param('id') id: string, @UploadedFile() file: Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }
    return this.documentsService.updateDocumentContent(id, file);
  }
}