import { Module, Logger } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { DocumentsModule } from './documents/documents.module';
import { IngestionModule } from './ingestion/ingestion.module';
import { User } from './users/entities/user.entity';
import { Document } from './documents/entities/document.entity';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const logger = new Logger('TypeOrmModule');
        try {
          const connectionOptions = {
            type: 'postgres' as const, // Explicitly cast to the correct type
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            entities: [User, Document],
            synchronize: true,
            logging: false,
            ssl: {
              rejectUnauthorized: false,
              ca: configService.get<string>('DB_SSL_CA'),
            },
          };
          logger.log('Database connection successful');
          return connectionOptions;
        } catch (error) {
          logger.error('Database connection error', error);
          throw error;
        }
      },
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    DocumentsModule,
    IngestionModule,
  ],
})
export class AppModule {}