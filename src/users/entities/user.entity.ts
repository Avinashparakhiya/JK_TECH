import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    OneToMany,
  } from 'typeorm';
  import * as bcrypt from 'bcrypt';
  import { Document } from '../../documents/entities/document.entity'; // Import Document entity
  
  export type UserRole = 'viewer' | 'editor' | 'admin';

  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ unique: true })
    email: string;
  
    @Column()
    name: string;
  
    @Column()
    password: string;
  
    @Column({ default: true })
    isActive: boolean;
  
    @Column({ type: 'enum', enum: ['viewer', 'editor', 'admin'], default: 'viewer' })
    role: UserRole;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    /**
     * Hash the password before saving to the database
     */
    @BeforeInsert()
    async hashPassword(): Promise<void> {
      this.password = await bcrypt.hash(this.password, 10);
    }
  
    // Relationship with documents (One user can have many documents)
    @OneToMany(() => Document, (document) => document.user)
    documents: Document[];
  }
  