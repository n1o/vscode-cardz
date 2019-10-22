import { TreeItem, TreeItemCollapsibleState, TreeDataProvider } from "vscode";
import { basename, join } from "path";
import { promises } from "fs";
import { StudyNoteEntity } from "../entity/StudyNoteEntity";
import { getRepository } from "typeorm";

export class StudyNode extends TreeItem {
    contextValue = 'studyNode';

    constructor(
        public readonly directory: string
    ) {
        super(basename(directory), TreeItemCollapsibleState.Collapsed);
        
    }

    get tooltip(): string {
        return `${this.label}`;
    }

    get description(): string {
        return "Study Node";
    }

    static isStudyNote(arg: any): arg is StudyNode {
        return arg.directory !== undefined && arg.contextValue === 'studyNode';
    }
} 

export class LastReviewSet extends TreeItem {
    contextValue = 'reviewNotes';

    constructor(){
        super('Last reviewed', TreeItemCollapsibleState.Collapsed);
    }

    get tooltip(): string {
        return 'Last reviewed';
    }

    get description(): string {
        return "Study Node";
    }

    async children(): Promise<LastReviewItem[]> {
        const repo = getRepository(StudyNoteEntity);
        const items = await repo.find({});
        return items.map(item => new LastReviewItem(item));
    }

    static isInstance(arg: any): arg is LastReviewSet {
        return arg.contextValue === 'reviewNotes';
    }
}

export class LastReviewItem extends TreeItem {
    contextValue = 'reviewItem';

    constructor(private readonly entity: StudyNoteEntity) {
        super(basename(entity.relativePath));
    }

    get tooltip(): string {
        return `Tooltip: ${this.entity.lastReviewed}`;
    }
    get description(): string {
        return `Description: ${this.entity.lastReviewed}`;
    }

}
export class StudyItem extends TreeItem {
    contextValue = 'studyItem';

    constructor(
        public readonly location: string
    ) {
        super(
            basename(location),
            TreeItemCollapsibleState.None
        );

        this.command = {
            command: "studyNotes.openFile",
            title: `Open: ${basename(location)}`,
            arguments: [location]
        };
        
    }
    static isInstance(arg: any): arg is StudyItem {
        return arg.contextValue === 'studyItem';
    }

}

type StudyElements = StudyNode | StudyItem | LastReviewSet | LastReviewItem;

export class StudyItemsProvider implements TreeDataProvider<StudyElements> {
    constructor (
        private readonly rootFolder: string,
        private readonly exlusionPatterns: RegExp[]
    ){}

    async getChildren(element?: StudyElements | undefined): Promise<StudyElements[]> {
        if(element) {
            if(StudyNode.isStudyNote(element)) {
                return this.elements(element.directory);
            } 
            if(StudyItem.isInstance(element)) {
                return [element];
            } 
            if(LastReviewSet.isInstance(element)) {
                return element.children();
            }
            return [];
        } else {
            return [new StudyNode(this.rootFolder), new LastReviewSet()];
        }
    }

    private validPath(localPath: string): boolean {
		for (const e of this.exlusionPatterns) {
			if (localPath.match(e)) {
				return false;
			}
		}
		return true;
    }


	private async listChildren(localPath: string): Promise<string[]> {
		const paths = await promises.readdir(localPath);

		return paths.filter(p => this.validPath(p)).map(p => join(localPath, p));
    }

    private async elements(directory: string): Promise<StudyElements[]> {
        const res: StudyElements[] = [];
        for (const childPath of await this.listChildren(directory)) {
            if ((await this.isDirectory(childPath))) {
                res.push(new StudyNode(childPath));
            } else {
                res.push(new StudyItem(childPath));
            }
        }

        return res;
    }

    private async isDirectory(localPath: string): Promise<boolean> {
        try {
            return (await promises.stat(localPath)).isDirectory();
        } catch (e) {
            return false;
        }
    }
    
    getTreeItem(element: StudyElements): TreeItem | Thenable<TreeItem>  {
        return element;
    }
}