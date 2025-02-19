import { Injectable } from '@nestjs/common';
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
    const adminCount = await this.userRepository.count({ where: { role: 'admin' } });
    const editorCount = await this.userRepository.count({ where: { role: 'editor' } });
    const viewerCount = await this.userRepository.count({ where: { role: 'viewer' } });
    return { admin: adminCount, editor: editorCount, viewer: viewerCount };
  }

  async getDocumentsUploadedByRole() {
    const adminCount = await this.documentRepository.count({ where: { user: { role: 'admin' } } });
    const editorCount = await this.documentRepository.count({ where: { user: { role: 'editor' } } });
    const viewerCount = await this.documentRepository.count({ where: { user: { role: 'viewer' } } });
    return { admin: adminCount, editor: editorCount, viewer: viewerCount };
  }

  async getDocumentsUploadedByUser() {
    const users = await this.userRepository.find({ relations: ['documents'] });
    const result = users
      .filter(user => user.role === 'admin' || user.role === 'editor')
      .map(user => ({
        user: user.fullName,
        role: user.role,
        documents: user.documents.map(doc => ({ id: doc.id, title: doc.title })),
      }));
    return result;
  }

  async getTotalDocumentsUploadedByAdminAndEditor() {
    const adminCount = await this.documentRepository.count({ where: { user: { role: 'admin' } } });
    const editorCount = await this.documentRepository.count({ where: { user: { role: 'editor' } } });
    return { total: adminCount + editorCount };
  }

  async getAllDocumentsWithUser() {
    const documents = await this.documentRepository.find({ relations: ['user'] });
    return documents.map(doc => ({
      id: doc.id,
      title: doc.title,
      uploadedBy: doc.user.fullName,
    }));
  }
}