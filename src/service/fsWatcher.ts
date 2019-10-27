import { Repository, getRepository } from "typeorm";
import { FileSystemWatcher, workspace } from "vscode";
import { FlashCardEntity } from "../entity/FlashCardEntity";
import { StudyNoteEntity } from "../entity/StudyNoteEntity";
import moment = require("moment");
import { getRelativePath } from "../util/pathUtils";
import { promises } from "fs";
import { flashCardsDirectory, walkDirectory } from "../util/walk";
import { join, basename } from "path";

export default class FsWatcher {

	readonly watcher: FileSystemWatcher;
	readonly flashCardRepo: Repository<FlashCardEntity>;
	readonly reviewRepo: Repository<StudyNoteEntity>;

	buffer: [Date, string][];
	constructor(pattern: string){
		this.buffer = [];
		this.watcher = workspace.createFileSystemWatcher(pattern, false, false, false);
		this.watcher.onDidCreate(async (e) => {
			console.log('Create', e.path);
			this.buffer.push([new Date(), e.path]);
		});
		this.watcher.onDidDelete(async (e) =>  {
			
			console.log('Delete', e.path);
			while(this.buffer.length > 0) {
				const date = new Date();
				const head = this.buffer.pop();
				if (head && moment(date).diff(head[0], "ms") < 10 && (await this.hasFlashCards(e.path))) {
					this.moveFlashCards(e.path, head[1]);
				}
			}
		});

		this.flashCardRepo = getRepository(FlashCardEntity);
	}

	async updateFlashCardEntity(oldPath: string, newPath: string) {
		const oldRelativePath = getRelativePath(oldPath);
		const newRelativePath = getRelativePath(newPath);
		const res = await this.flashCardRepo.update({ relativePath: oldRelativePath }, { relativePath: newRelativePath });
		return res;
	}

	async updateReviewEntity(oldPath: string, newPath: string) {
		const oldRelativePath = getRelativePath(oldPath);
		const newRelativePath = getRelativePath(newPath);
		const res = await this.reviewRepo.update({ relativePath: oldRelativePath }, { relativePath: newRelativePath});
		return res;
	}

	async hasFlashCards(oldPath: string): Promise<boolean> {
		const stat = await promises.stat(flashCardsDirectory(oldPath));
		try { 
			return stat.isDirectory();
		} catch (e) {
			return false;
		}
	}

	async moveFlashCards(oldPath: string, newPath: string) {
		const oldFlashCardPath = flashCardsDirectory(oldPath);
		try {
			const isDir = (await promises.stat(oldFlashCardPath)).isDirectory();
			if(isDir) {
				const newFlashCardsPath = flashCardsDirectory(newPath);
				try {
					await promises.mkdir(newFlashCardsPath);
				} catch (e) {}
				const oldCards = await walkDirectory(oldFlashCardPath);
				for (const oldCardPath of oldCards) {
					const newCardPath = join(newFlashCardsPath, basename(oldCardPath));
					await this.updateFlashCardEntity(oldCardPath, newCardPath);
					await promises.copyFile(oldCardPath, newCardPath );
					await promises.unlink(oldCardPath);
				}
				await this.updateReviewEntity(oldPath, newPath);
				await promises.rmdir(oldFlashCardPath);
			}
		} catch (e){
			console.log(e);
		}
	}
}