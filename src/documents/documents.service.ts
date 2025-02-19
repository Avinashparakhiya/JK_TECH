import { Injectable, NotFoundException } from '@nestjs/common';
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
    // You can add additional logic here for saving file details to the database
    const document = new Document();
    document.title = file.originalname; // Set the document title from the uploaded file name
    document.content = file.buffer.toString(); // Convert file buffer to string (or save the file to cloud storage and save the URL)
    document.uploadedBy = file.originalname; // Can use file name or a more user-specific detail

    // Retrieve the user (if required) - for example, by some user identification (this can be added to the request)
    const user = await this.userRepository.findOne({ where: { id: 'some-user-id' } }); // You may need to pass the actual user id from JWT

    if (user) {
      document.user = user; // Associate the document with the user
    }

    return this.documentRepository.save(document); // Save the document to the database
  }

  async findAllWithUser(): Promise<Document[]> {
    return this.documentRepository.find({ relations: ['user'] });
  }

  async softDeleteDocument(id: string): Promise<void> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }
    document.isActive = false;
    document.modifiedAt = new Date(); // Update modifiedAt timestamp
    await this.documentRepository.save(document);
  }

  async updateDocumentContent(id: string, file: Multer.File): Promise<Document> {
    const document = await this.documentRepository.findOne({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found.`);
    }

    document.content = file.buffer.toString();
    document.modifiedAt = new Date(); // Update modifiedAt timestamp
    return this.documentRepository.save(document);
  }
}
