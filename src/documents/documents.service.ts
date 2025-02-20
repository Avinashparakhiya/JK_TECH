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
  ) {}

  /**
   * Save a document
   * @param file - The file uploaded by the user
   */
  async saveDocument(file: Multer.File): Promise<Document> {
    try {
      const document = new Document();
      document.title = file.originalname; // Set the document title from the uploaded file name
      document.content = file.buffer.toString(); // Convert file buffer to string
      document.uploadedBy = file.originalname; // Example placeholder; replace with user-specific details if needed

      // Retrieve the user (if required) - for example, by some user identification (this can be added to the request)
      const user = await this.userRepository.findOne({ where: { id: 'some-user-id' } }); // Replace with actual user ID from JWT or request context

      if (user) {
        document.user = user; // Associate the document with the user
      }

      return await this.documentRepository.save(document); // Save the document to the database
    } catch (error) {
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
