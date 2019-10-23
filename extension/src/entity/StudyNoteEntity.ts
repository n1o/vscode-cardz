import {Entity, PrimaryColumn, Column} from "typeorm";

@Entity()
export class StudyNoteEntity {
    constructor(
        relativePath: string, lastReviewed?: Date
    ) {
        this.relativePath = relativePath;
        if(lastReviewed) {
            this.lastReviewed = lastReviewed;
        } else {
            this.lastReviewed = new Date();
        }
    }

    @PrimaryColumn()
    relativePath: string;

    @Column()
    lastReviewed: Date;
}