import { TreeItem, TreeItemCollapsibleState, TreeDataProvider } from "vscode";
import { basename, join } from "path";
import { promises } from "fs";

export class StudyNode extends TreeItem {
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

    contextValue = 'studyNode';
} 

export class StudyItem extends TreeItem {
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
    contextValue = 'studyItem';
}

type StudyElements = StudyNode | StudyItem;

export class StudyItemsProvider implements TreeDataProvider<StudyElements> {
    constructor (
        private readonly rootFolder: string,
        private readonly exlusionPatterns: RegExp[]
    ){}

    async getChildren(element?: StudyElements | undefined): Promise<StudyElements[]> {
        if(element) {
            if(StudyNode.isStudyNote(element)) {
                return this.elements(element.directory);
            } else {
                return [element];
            }
        } else {
            return this.elements(this.rootFolder);
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