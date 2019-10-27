
import * as vscode from 'vscode';
import { getFlashCards } from '../util/walk';
import { ReviewService } from '../service/reviewService';
import { getRelativePath } from '../util/pathUtils';
import { basename, join } from 'path';
import { CardService } from '../service/cardService';
import { CardInfoService } from '../service/cardInfoService';
import moment = require('moment');

export default async function webView(
    file: vscode.Uri,
    context: vscode.ExtensionContext, 
    reviewService: ReviewService,
    cardsInforService: CardInfoService
    ) {

    const panel = vscode.window.createWebviewPanel(
        'studyNode',
        'Study Notes',
        vscode.ViewColumn.One,
        {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.file(join(context.extensionPath, 'media'))]
        }
    );

    const relativePath = getRelativePath(file.path);
    const noteName = basename(file.path);
    const lastReview = await reviewService.lastReviewed(relativePath);
    const lastReviewString = lastReview ?  moment(lastReview,'YYYYMMDD').fromNow() : 'Never';

    const cards = await Promise.all((await getFlashCards(file.path)).map( 
        async cardPath =>  { 
            const { front, deck } = await CardService.getFrontDeck(cardPath);
            return { front, deck };
        }
    ));
    
    panel.webview.html = cardsInforService.getInfoHtml(
        noteName,
        lastReviewString,
        cards
    );
}
