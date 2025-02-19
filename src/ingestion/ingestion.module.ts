import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { User } from '../users/entities/user.entity';
import { Document } from '../documents/entities/document.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Document])],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}