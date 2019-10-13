import { ExtensionContext, window, StatusBarItem, StatusBarAlignment, commands, Disposable } from "vscode";
import getActiveDocument from "../util/activeDocument";
import getRelativePath from "../util/relativePath";
import { ReviewService } from "../service/reviewService";


let statusBar: StatusBarItem;
let counter = 1;
let command: Disposable;

export async function startReview(context: ExtensionContext, reviewService: ReviewService) {
    const document = getActiveDocument("Select note to review");

    const note = document!.uri;
    const relativePath = getRelativePath(note.path);

    reviewService.reviewNow(relativePath);

    if (!statusBar) {
        statusBar = window.createStatusBarItem(StatusBarAlignment.Left, 100);

        statusBar.text = `Review Time: ${counter}`;
        statusBar.command = 'endReview';
        statusBar.show();
        setInterval(() => {
            counter += 1;
            statusBar.text = `Review Time: ${counter}`;
            statusBar.show();
        }, 1000);
    }
    if(!command) {
        command = commands.registerCommand(
            'endReview', () => finishReview(context, reviewService)
        );
        context.subscriptions.push(command);
    }
}

async function finishReview(context: ExtensionContext, reviewService: ReviewService) {
    statusBar.dispose();
}