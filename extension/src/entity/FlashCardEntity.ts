import {Entity, PrimaryColumn, Column} from "typeorm";

@Entity()
export class FlashCardEntity {

    @PrimaryColumn()
    id: string;

    @Column()
    relativePath: string;

    @Column()
    deck: string;
}