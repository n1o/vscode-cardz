import { StatusBarAlignment, window, StatusBarItem, Disposable, Range } from "vscode";
import { DocumentChecker } from "../service/documentLength";
import { basename } from "path";

const SUPPORTED_DOCUMENT_TYPE = "markdown";

export class LengthController {

    private statusbarItem: StatusBarItem;
    private disposable: Disposable;
    private MAX_LENGTH: number;

    constructor(
        private readonly checker: DocumentChecker,
        private readonly roothDirectory: string){

        this.statusbarItem = window.createStatusBarItem(StatusBarAlignment.Left);
        const changeEditorSelection =  window.onDidChangeTextEditorSelection(this.updateEvent, this);
        const changeActiveTextEditor =  window.onDidChangeActiveTextEditor(this.updateEvent, this);

        this.disposable = Disposable.from(...[this.statusbarItem, changeActiveTextEditor, changeEditorSelection]);
        this.MAX_LENGTH = checker.DocumentMaxLength;
    };

    private updateEvent() {
        const editor = window.activeTextEditor;
        if(!editor) {
            this.statusbarItem.hide();
            return;
        }

        const doc = editor.document;

        if(doc.languageId === SUPPORTED_DOCUMENT_TYPE) {
            const documentName = basename(doc.fileName);
            const documentPath = doc.fileName.replace(this.roothDirectory, "");
            const documentText = doc.getText();
            
            const { documentLength, documentValid, previousValidDocumentText } = this.checker.checkDocument(documentPath, documentText);

            this.statusbarItem.text = this.remainingLength(documentLength, this.MAX_LENGTH);
            this.statusbarItem.show();

            if(!documentValid) {
                window.showErrorMessage(`${documentName} is too long`);
            }

        } else {
            this.statusbarItem.hide();
        }
    }

    public remainingLength(line: number, maxLength: number): string {
        return `Document length ${Math.round((line / maxLength) * 100) }%`;
    }

    public dispose() {
        this.disposable.dispose();
    };
}