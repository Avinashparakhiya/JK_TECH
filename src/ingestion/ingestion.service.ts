import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Document } from '../documents/entities/document.entity';

@Injectable()
export class IngestionService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
  ) {}

  async getTotalUsersByRole() {
    try {
      const adminCount = await this.userRepository.count({ where: { role: 'admin' } });
      const editorCount = await this.userRepository.count({ where: { role: 'editor' } });
      const viewerCount = await this.userRepository.count({ where: { role: 'viewer' } });
      return { admin: adminCount, editor: editorCount, viewer: viewerCount };
    } catch (error) {
      throw new HttpException(
        `Failed to get total users by role: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDocumentsUploadedByRole() {
    try {
      const adminCount = await this.documentRepository.count({ where: { user: { role: 'admin' } } });
      const editorCount = await this.documentRepository.count({ where: { user: { role: 'editor' } } });
      const viewerCount = await this.documentRepository.count({ where: { user: { role: 'viewer' } } });
      return { admin: adminCount, editor: editorCount, viewer: viewerCount };
    } catch (error) {
      throw new HttpException(
        `Failed to get documents uploaded by role: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getDocumentsUploadedByUser() {
    try {
      const users = await this.userRepository.find({ relations: ['documents'] });
      const result = users
        .filter(user => user.role === 'admin' || user.role === 'editor')
        .map(user => ({
          user: user.name,
          role: user.role,
          documents: user.documents.map(doc => ({ id: doc.id, title: doc.title })),
        }));
      return result;
    } catch (error) {
      throw new HttpException(
        `Failed to get documents uploaded by user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getTotalDocumentsUploadedByAdminAndEditor() {
    try {
      const adminCount = await this.documentRepository.count({ where: { user: { role: 'admin' } } });
      const editorCount = await this.documentRepository.count({ where: { user: { role: 'editor' } } });
      return { total: adminCount + editorCount };
    } catch (error) {
      throw new HttpException(
        `Failed to get total documents uploaded by admin and editor: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getAllDocumentsWithUser() {
    try {
      const documents = await this.documentRepository.find({ relations: ['user'] });
      return documents.map(doc => ({
        id: doc.id,
        title: doc.title,
        uploadedBy: doc.user.name,
      }));
    } catch (error) {
      throw new HttpException(
        `Failed to get all documents with user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
