import * as vscode from 'vscode';
import { sep } from 'path';
import { promises } from 'fs';
import * as MarkdownIt from 'markdown-it';
import { load } from 'cheerio';
import { DeckService } from './service/deckService';
import { render } from 'mustache';
import { findAllImagePaths } from './util/mdUtils';

const newCardMd = `---
Deck: {{deck}}
Front: {{{front}}}
Back:
---
{{{content}}}`;

export default async function newNote(context: vscode.ExtensionContext, decsService: DeckService) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        
        const file = editor.document.uri;
        const splited = file.path.split(sep);
        const fileName = splited.pop();
        const flashCardsDirectoryPath = [...splited, `.${fileName}.flashCards`].join(sep); 
        try {
            await promises.mkdir(flashCardsDirectoryPath);
        } catch (err) {}

        const allDecs = await decsService.getAllDecks();

        const quickPick = vscode.window.createQuickPick();
        quickPick.items = allDecs.map( deck =>  { return { label: deck.deckName };});
        quickPick.onDidChangeSelection( async selection => {
            if (selection[0]) {
                const deck = selection[0].label;
                quickPick.value = deck;
                quickPick.dispose();

                const { name, content } = processMarkdown(text);

                const flashCardName = `${name.replace(/[\W_]+/g, "_")}.md`;
        
                const flashCardPath = [flashCardsDirectoryPath, flashCardName].join(sep);
                const f = await promises.open(flashCardPath, "w");
                await f.write(render(newCardMd, { deck, front:  name, content }));
                await f.close();
                const flashCardUri = vscode.Uri.parse(flashCardPath);
                decsService.storeCard({ deck, front: name, back: content }, flashCardUri);
                vscode.commands.executeCommand('vscode.open', flashCardUri);
                
            }
        });
        quickPick.canSelectMany = false;
        quickPick.title = "Select A Deck";
        quickPick.onDidHide(() => quickPick.dispose());
        quickPick.show();
    } else {
        vscode.window.showErrorMessage("Select the text you want to make a flashcard from");
    }
}

interface FlashCard {
    name: string;
    content: string;
}

function processMarkdown(content: string): FlashCard {
    const md = new MarkdownIt();
    const html = md.render(content);
    const $ = load(html);
    const header = findHeader($);

    if (!header) {
        throw new Error("Failed to find header");
    }

    for (const imagePath of findAllImagePaths(content)) {
        // Check if it not an absolute path!
        if(!imagePath.startsWith(sep)) {
            content = content.replace(imagePath, `../${imagePath}`);
        }
    }

    return {
        name: header,
        content: content.replace(header, ''),
    };
}

function findHeader(data: CheerioStatic, fromLevel: number = 1): string | undefined {
    const text = data(`h${fromLevel}`).first().text();
    if (text) {
        return `${"#".repeat(fromLevel)} ${text}`;
    } else if (fromLevel < 5) {
        return findHeader(data, fromLevel + 1);
    } else {
        return undefined;
    }
}