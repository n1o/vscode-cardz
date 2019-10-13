import {Entity, PrimaryColumn, Column} from "typeorm";

@Entity()
export class StudyNoteEntity {

    @PrimaryColumn()
    relativePath: string;

    @Column()
    lastReviewed: Date;
}