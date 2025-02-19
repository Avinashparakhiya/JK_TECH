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

  @Column()
  content: string;

  @Column()
  uploadedBy: string;

  @ManyToOne(() => User, (user) => user.id) // Many documents can belong to one user
  @JoinColumn({ name: 'userId' }) // This is the foreign key column
  user: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  modifiedAt: Date; // Add modifiedAt column to track updates

  @Column({ default: true })
  isActive: boolean; // Add isActive column with default value true
}
