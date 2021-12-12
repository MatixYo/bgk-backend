import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Grant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  link: string;
}
