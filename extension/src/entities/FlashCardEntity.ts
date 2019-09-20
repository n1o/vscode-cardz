import {Entity, Column, PrimaryColumn} from "typeorm";

@Entity()
export class FlashCardEntity {

    @PrimaryColumn()
    pathFromRootDir!: string;

    @Column()
    ankiCardId!: string;

    @Column()
    deck!: string;
}