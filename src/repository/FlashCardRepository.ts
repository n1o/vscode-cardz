import { EntityRepository, Repository, In } from "typeorm";
import { FlashCardEntity } from "../entity/FlashCardEntity";


@EntityRepository(FlashCardEntity)
export class FlashCardRepository extends Repository<FlashCardEntity> {
    async findAll(relativePaths: string[]) {
        return this.find({ where: { relativePath: In(relativePaths)}});
    }
}