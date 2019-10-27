import { ExtensionContext, window, StatusBarItem, StatusBarAlignment, commands, Disposable, Uri } from "vscode";
import getActiveDocument from "../util/activeDocument";
import { getRelativePath } from "../util/pathUtils";
import { ReviewService } from "../service/reviewService";
import * as moment from 'moment';
import { basename } from "path";

const CURRENTLY_REVIEWING = 'note_reviewing';

function getReviewText(noteName: string, minutes: number): string  {
    return `Reviewing ${noteName} for ${minutes} minutes`;
}

function createReviewStatusBar(noteName: string): [StatusBarItem, Disposable] {
    const statusBar = window.createStatusBarItem(StatusBarAlignment.Left, 0);
    const reviewStart = new Date();
    
    statusBar.text = getReviewText(noteName, 0);
    statusBar.command = 'endReview';

    const command = commands.registerCommand('endReview', () => statusBar.dispose());
    setInterval(() => {
        const duration = Math.floor(moment.duration(moment(new Date()).diff(reviewStart)).asMinutes());
        statusBar.text = getReviewText(noteName, duration);
        statusBar.tooltip = "Cancel";
    }, 10000);

    return [statusBar, command];
}

let statusBar: StatusBarItem;

export async function startReview(context: ExtensionContext, reviewService: ReviewService) {
    const document =  getActiveDocument("Select note to review");

    const note = document!.uri;
    const relativePath = getRelativePath(note.path);

    const reviewing = context.workspaceState.get<string>(CURRENTLY_REVIEWING);

    if (reviewing && statusBar) {
        statusBar.dispose();
    }

    if (!statusBar) {
       const [bar, command ] = createReviewStatusBar(basename(note.path));
       statusBar = bar;
       context.subscriptions.push(command);
       statusBar.show();
    }

    reviewService.reviewNow(relativePath);
    context.workspaceState.update(CURRENTLY_REVIEWING, relativePath);
}