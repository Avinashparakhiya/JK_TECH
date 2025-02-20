import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { User } from '../users/entities/user.entity';
import { Multer } from 'multer';

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>, // Inject User repository to associate with documents
  ) { }

  /**
   * Save a document
   * @param file - The file uploaded by the user
   */
  async saveDocument(file: Multer.File, currentUser: User): Promise<Document> {
    try {
      if (!file) {
        throw new HttpException('File is required.', HttpStatus.BAD_REQUEST);
      }
      if (!currentUser) {
        throw new HttpException('Current user is required.', HttpStatus.BAD_REQUEST);
      }
  
      const document = new Document();
  
      // Set document metadata
      document.title = file.originalname;
      document.content = file.buffer; // Store raw binary data
      document.uploadedBy = currentUser.name || 'Unknown User';
      document.user = currentUser;
  
      // Save the document to the database
      const savedDocument = await this.documentRepository.save(document);
  
      console.log('Document saved successfully:', savedDocument);
      return savedDocument;
    } catch (error) {
      console.error('Error saving document:', error.message);
      throw new HttpException(
        `Failed to save document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  
  async findAllWithUser(): Promise<Document[]> {
    try {
      return await this.documentRepository.find({ relations: ['user'] });
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve documents: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async softDeleteDocument(id: string): Promise<void> {
    try {
      const document = await this.documentRepository.findOne({ where: { id } });
      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found.`);
      }
      document.isActive = false;
      document.modifiedAt = new Date(); // Update modifiedAt timestamp
      await this.documentRepository.save(document);
    } catch (error) {
      throw new HttpException(
        `Failed to delete document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async updateDocumentContent(id: string, file: Multer.File): Promise<Document> {
    try {
      const document = await this.documentRepository.findOne({ where: { id } });
      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found.`);
      }

      document.content = file.buffer.toString();
      document.modifiedAt = new Date(); // Update modifiedAt timestamp
      return await this.documentRepository.save(document);
    } catch (error) {
      throw new HttpException(
        `Failed to update document content: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
