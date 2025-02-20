import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from 'src/users/entities/user.entity'; // Import User entity

@Entity('documents')
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  // Change this column to handle binary content
  @Column({ type: 'bytea' }) // For PostgreSQL, 'bytea' is used for binary data
  content: Buffer;

  @Column()
  uploadedBy: string;

  @ManyToOne(() => User, (user) => user.id, { nullable: false }) // Ensure the user is not null
  @JoinColumn({ name: 'userId' }) // This is the foreign key column
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date;

  @Column({ default: true })
  isActive: boolean;
}
