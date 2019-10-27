import { promises } from "fs";
import { createConnection } from "typeorm";
import { StudyNoteEntity } from "../entity/StudyNoteEntity";
import { FlashCardEntity } from "../entity/FlashCardEntity";
import { join } from "path";

export default async function initTypeOrm(sqlLitepath: string) {
	try {
		if(!(await promises.stat(sqlLitepath)).isDirectory()) {
			throw new Error("Cannot create local storage");
		}
	} catch (err) {
		if (err.code === 'ENOENT') {
			(await promises.mkdir(sqlLitepath));
		}
	}

	return createConnection({
		type: "sqljs",
		synchronize: true,
		autoSave: true,
		location: join(sqlLitepath, '.cardz.sqllite'),
		entities: [StudyNoteEntity, FlashCardEntity]
	});
}