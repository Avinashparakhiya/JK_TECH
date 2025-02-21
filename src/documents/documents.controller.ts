import { Controller, Post, UseInterceptors, UploadedFile, UseGuards, BadRequestException, Get, Delete, Param, Put, Req, Res, NotFoundException, HttpException, HttpStatus, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentsService } from './documents.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Multer,memoryStorage } from 'multer';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { UsersService } from 'src/users/users.service';
import { Response } from 'express';
import { Request as ExpressRequest } from 'express';

@ApiTags('documents')
@Controller('documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
    private readonly usersService: UsersService, // Inject UsersService
  ) { }

  @Post('upload')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('editor', 'admin')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 1 * 1024 * 1024 } })) // 1 MB limit
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload a document' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  async uploadDocument(
    @UploadedFile() file: Multer.File,
    @Req() req: Request,
    @Query('title') title?: string // Use query parameter for title
  ) {
    if (!file) {
      throw new BadRequestException('File is required.');
    }

    try {
      // Retrieve the current user
      const currentUser = await this.usersService.getCurrentUser(req);

      if (!currentUser) {
        throw new BadRequestException('Unable to identify the current user.');
      }

      // Ensure the file is properly encoded
      if (!file.buffer) {
        throw new BadRequestException('File buffer is empty.');
      }

      // Use query parameter 'title' or fallback to the file's original name
      const documentTitle = title || file.originalname;

      // Call the service to save the document
      return await this.documentsService.saveDocument(file, documentTitle, currentUser);
    } catch (error) {
      throw new BadRequestException('Failed to upload document.');
    }
  }


  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('editor', 'admin', 'viewer')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get document by ID' })
  @ApiResponse({ status: 200, description: 'Document retrieved successfully.' })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  async getDocumentById(@Param('id') id: string, @Res() res: Response) {
    try {
      const document = await this.documentsService.findDocumentById(id);
      if (!document) {
        throw new NotFoundException('Document not found.');
      }

      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);

      res.end(document.content);
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
  @UseInterceptors(FileInterceptor('file', { 
    storage: memoryStorage(), // Ensure memory storage for file buffer
    limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB limit
  }))
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a document' })
  @ApiResponse({ status: 200, description: 'Document updated successfully.' })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  async updateDocument(
    @Param('id') id: string, 
    @UploadedFile() file: Multer.File,
  ) {
    // Validate if a file is uploaded
    if (!file) {
      throw new BadRequestException('File is required.');
    }
    // Pass the file to the service for updating the document content
    return this.documentsService.updateDocumentContent(id, file);
  }  
}