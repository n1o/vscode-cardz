import { getRepository } from "typeorm";
import { StudyNoteEntity } from "../entity/StudyNoteEntity";

export class ReviewService {

    async reviewNow(relativePath: string) {
        const repo = getRepository(StudyNoteEntity);

        let entity = await repo.findOne(relativePath);
        if(entity) {
            entity.lastReviewed = new Date();
        } else {
            entity = new StudyNoteEntity();
            entity.lastReviewed = new Date();
            entity.relativePath = relativePath;
        }

        await repo.save(entity);
    }
}