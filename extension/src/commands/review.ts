import { ExtensionContext, window, StatusBarItem, StatusBarAlignment, commands, Disposable } from "vscode";
import getActiveDocument from "../util/activeDocument";
import { getRelativePath } from "../util/pathUtils";
import { ReviewService } from "../service/reviewService";
import * as moment from 'moment';

const CURRENTLY_REVIEWING = 'note_reviewing';

function createReviewStatusBar(): [StatusBarItem, Disposable] {
    const statusBar = window.createStatusBarItem(StatusBarAlignment.Left, 0);
    const reviewStart = new Date();
    
    statusBar.text = `Reviewing ${0} minutes`;
    statusBar.command = 'endReview';

    const command = commands.registerCommand('endReview', () => statusBar.dispose());
    setInterval(() => {
        const duration = Math.floor(moment.duration(moment(new Date()).diff(reviewStart)).asMinutes());
        statusBar.text = `Reviewing ${duration} minutes`;
    }, 10000);

    return [statusBar, command];
}

let statusBar: StatusBarItem;

export async function startReview(context: ExtensionContext, reviewService: ReviewService) {
    const document = getActiveDocument("Select note to review");

    const note = document!.uri;
    const relativePath = getRelativePath(note.path);

    const reviewing = context.workspaceState.get<string>(CURRENTLY_REVIEWING);

    if (reviewing) {
        statusBar.dispose();
    }

    if (!statusBar) {
       const [bar, command ] = createReviewStatusBar();
       statusBar = bar;
       context.subscriptions.push(command);
       statusBar.show();
    }

    reviewService.reviewNow(relativePath);
    context.workspaceState.update(CURRENTLY_REVIEWING, relativePath);
}