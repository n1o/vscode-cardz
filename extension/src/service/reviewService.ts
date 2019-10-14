import { getRepository, Repository } from "typeorm";
import { StudyNoteEntity } from "../entity/StudyNoteEntity";

export class ReviewService {

    readonly repo: Repository<StudyNoteEntity>;
    constructor() {
        this.repo = getRepository(StudyNoteEntity);
    }

    async reviewNow(relativePath: string) {
        
        let entity = await this.repo.findOne(relativePath);
        if(entity) {
            entity.lastReviewed = new Date();
        } else {
            entity = new StudyNoteEntity();
            entity.lastReviewed = new Date();
            entity.relativePath = relativePath;
        }

        await this.repo.save(entity);
    }
    async lastReviewd(relativePath: string): Promise<Date | undefined> {
        const entity = await this.repo.findOne(relativePath);
        if (entity) {
            return entity.lastReviewed;
        }
    }
}