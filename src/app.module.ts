import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { User } from './users/entities/user.entity';
import { Document } from './documents/entities/document.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'password',
      database: 'test',
      entities: [User, Document],
      synchronize: true,
    }),
    UsersModule,
    DocumentsModule,
    IngestionModule,
  ],
})
export class AppModule {}