import * as vscode from 'vscode';
import { sep, parse } from 'path';
import { promises } from 'fs';
import * as MarkdownIt from 'markdown-it';
import { load } from 'cheerio';

export default async function newNote(context: vscode.ExtensionContext) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const selection = editor.selection;
        const text = editor.document.getText(selection);
        
        const file = editor.document.uri;
        const splited = file.path.split(sep);
        const fileName = splited.pop();
        const flashCardsDirectoryPath = [...splited, `.${fileName}.flashCards`].join(sep); 
        console.log(flashCardsDirectoryPath);
        try {
            await promises.mkdir(flashCardsDirectoryPath);
        } catch (err) {}

        const { name, content } = processMarkdown(text);
        const flashCardName = name.replace(/[\W_]+/g, "_");
        const f = await promises.open([flashCardsDirectoryPath, flashCardName].join(sep), "w");
        await f.write(content);
        await f.close();
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