import { Injectable, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document } from './entities/document.entity';
import { User } from '../users/entities/user.entity';
import { Multer } from 'multer';

interface DocumentWithFileBuffer {
  id: string;
  originalName: string;
  mimeType: string;
  content: Buffer; // Add the content property
  user: User;
}

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
  async saveDocument(file: Multer.File, documentTitle: string, currentUser: User): Promise<Document> {
    try {
      if (!file) {
        throw new HttpException('File is required.', HttpStatus.BAD_REQUEST);
      }
      if (!currentUser) {
        throw new HttpException('Current user is required.', HttpStatus.BAD_REQUEST);
      }
      const document = new Document();
      // Set document metadata
      document.title = documentTitle;
      document.content = file.buffer; // Store raw binary data
      document.originalName = file.originalname;
      document.mimeType = file.mimetype; // Set the mimeType
      document.user = currentUser;

      // Save the document to the database
      const savedDocument = await this.documentRepository.save(document);
      return savedDocument;
    } catch (error) {
      throw new HttpException(
        `Failed to save document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAllWithUser(): Promise<Document[]> {
    try {
      return await this.documentRepository.find({ where: { isActive: true }, relations: ['user'] });
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
      // Find the document by ID
      const document = await this.documentRepository.findOne({ where: { id, isActive: true } });
      if (!document) {
        throw new NotFoundException(`Document with ID ${id} not found.`);
      }
      // Update the document fields
      document.content = file.buffer; // Store the raw buffer directly
      document.mimeType = file.mimetype; // Update the mime type
      document.modifiedAt = new Date(); // Update the modifiedAt timestamp
      document.originalName = file.originalname;

      // Save the updated document
      return await this.documentRepository.save(document);
    } catch (error) {
      throw new HttpException(
        `Failed to update document content: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }


  async findDocumentById(id: string): Promise<DocumentWithFileBuffer> {
    try {
      const document = await this.documentRepository.findOne({
        where: { id },
        select: ['id', 'originalName', 'mimeType', 'content', 'user'], // Include fileBuffer
        relations: ['user'],
      });

      if (!document) {
        throw new NotFoundException('Document not found.');
      }

      return {
        id: document.id,
        originalName: document.originalName,
        mimeType: document.mimeType,
        content: document.content,
        user: document.user,
      };
    } catch (error) {
      throw new HttpException(
        `Failed to retrieve document: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}