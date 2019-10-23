import { EntityRepository, Repository, In } from "typeorm";
import { FlashCardEntity } from "../entity/FlashCardEntity";


@EntityRepository(FlashCardEntity)
export class FlashCardRepository extends Repository<FlashCardEntity> {
    findAll(relativePaths: string[]) {
        return this.find({ where: { relativePath: In(relativePaths)}});
    }
}