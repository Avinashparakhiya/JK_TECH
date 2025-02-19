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
      host: 'sql12.freesqldatabase.com',
      port: 3306,
      username: 'sql12763500',
      password: 'ZUMDr97Gbs',
      database: 'sql12763500',
      entities: [User, Document],
      synchronize: true,
    }),
    UsersModule,
    DocumentsModule,
    IngestionModule,
  ],
})
export class AppModule {}