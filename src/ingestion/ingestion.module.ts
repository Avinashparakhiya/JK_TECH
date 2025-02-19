import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IngestionController } from './ingestion.controller';
import { IngestionService } from './ingestion.service';
import { User } from '../users/entities/user.entity';
import { Document } from '../documents/entities/document.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Document]), UsersModule],
  controllers: [IngestionController],
  providers: [IngestionService],
})
export class IngestionModule {}