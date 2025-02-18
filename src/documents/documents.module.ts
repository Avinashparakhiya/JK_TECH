import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { Document } from './entities/document.entity';
import { UsersModule } from '../users/users.module'; // Import UsersModule to access User entity

@Module({
  imports: [TypeOrmModule.forFeature([Document]), UsersModule], // Register Document entity and UsersModule
  controllers: [DocumentsController],
  providers: [DocumentsService],
})
export class DocumentsModule {}
