import { renderString } from "nunjucks";

const htmlTemplate = 
`<!DOCTYPE html><html lang=en>
<head>
    <meta charset=utf-8>
    <meta name=viewport content="width=device-width,initial-scale=1">
    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src vscode-resource: https:; script-src 'unsafe-inline' 'unsafe-eval' vscode-resource:  https:; style-src vscode-resource: https:;"/>
    <link rel="stylesheet" type="text/css" href="{{tailWindCss}}">
    </head>
    <body>
    <div class="flex flex-row">
        <div class="px-4 py-2 font-bold">
            Note: <span class="font-light">{{noteName}}</span>
        </div>
        <div class="px-4 py-2 font-bold">
            Last Reviewed: <span class="font-light">{{lastReviewed}}</span>
        </div>
    </div>
    <div class="px-4 py-2">
        <div class="font-bold"> Flash Cards:</div>
        <table class="table-auto">
            <thead>
                <tr>
                <th class="px-4 py-2">Front</th>
                <th class="px-4 py-2">Deck</th>
                </tr>
            </thead>
            <tbody>
                {% for card in cards%}
                <tr>
                    <td class="border px-4 py-2">{{card.front}}</td>
                    <td class="border px-4 py-2">{{card.deck}}</td>
                </tr>
                {% endfor %}
            </tbody>
        </table>
</div>
</body>
</html>`;
export class CardInfoService {
    constructor(private readonly tailwindCss: string) { }

    getInfoHtml(noteName: string, lastReviewed: string, cards: {front: string, deck: string}[]): string {
        return renderString(htmlTemplate, {
            tailWindCss: this.tailwindCss,
            noteName,
            lastReviewed,
            cards,
        });
    }
}