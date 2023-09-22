import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column('text', {
    unique: true,
  })
  email: string;
  @Column('text', {
    select: false,
  })
  password: string;
  @Column('text')
  firstName: string;
  @Column('text')
  lastName: string;
  @Column('text')
  fullName: string;
  @Column('bool', {
    default: true,
  })
  isActive: string;
  @Column('text', {
    array: true,
    default: ['USER'],
  })
  roles: string;

  @BeforeInsert()
  checkFieldsBeforeInsert() {
    this.email = this.email.toLocaleLowerCase().trim();
    this.firstName = this.firstName.toUpperCase().trim();
    this.lastName = this.lastName.toUpperCase().trim();
    this.fullName = `${this.firstName} ${this.lastName}`;
  }

  @BeforeUpdate()
  checkFieldsBeforeUpdate() {
    this.checkFieldsBeforeInsert();
  }
}
