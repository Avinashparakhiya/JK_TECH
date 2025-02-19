import { Controller, Get, UseGuards } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { RolesGuard } from 'src/shared/guards/roles.guard';
import { Roles } from 'src/shared/decorators/roles.decorator';

@ApiTags('ingestion')
@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  @Get('total-users-by-role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total number of users by role' })
  @ApiResponse({ status: 200, description: 'Total number of users by role retrieved successfully.' })
  async getTotalUsersByRole() {
    return this.ingestionService.getTotalUsersByRole();
  }

  @Get('documents-uploaded-by-role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get number of documents uploaded by each role' })
  @ApiResponse({ status: 200, description: 'Number of documents uploaded by each role retrieved successfully.' })
  async getDocumentsUploadedByRole() {
    return this.ingestionService.getDocumentsUploadedByRole();
  }

  @Get('documents-uploaded-by-user')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get documents uploaded by each user for admin and editor roles' })
  @ApiResponse({ status: 200, description: 'Documents uploaded by each user for admin and editor roles retrieved successfully.' })
  async getDocumentsUploadedByUser() {
    return this.ingestionService.getDocumentsUploadedByUser();
  }

  @Get('total-documents-uploaded-by-admin-and-editor')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get total documents uploaded by admin and editor' })
  @ApiResponse({ status: 200, description: 'Total documents uploaded by admin and editor retrieved successfully.' })
  async getTotalDocumentsUploadedByAdminAndEditor() {
    return this.ingestionService.getTotalDocumentsUploadedByAdminAndEditor();
  }

  @Get('all-documents-with-user')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all documents with the user who uploaded them' })
  @ApiResponse({ status: 200, description: 'All documents with the user who uploaded them retrieved successfully.' })
  async getAllDocumentsWithUser() {
    return this.ingestionService.getAllDocumentsWithUser();
  }
}