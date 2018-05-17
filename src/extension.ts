'use strict';

import * as vscode from 'vscode';
import * as ts from 'typescript';
import { createGenerator } from 'typescript-to-json-schema';

function getIdentifierAtLocation(sourceFile: ts.SourceFile, cursorPosition: vscode.Position): ts.Identifier | null {
    const cursorLocation = sourceFile.getPositionOfLineAndCharacter(cursorPosition.line, cursorPosition.character);
    let nodes = sourceFile.getChildren();

    while (nodes) {
        let node = nodes.find((n: ts.Node) => cursorLocation > n.pos && cursorLocation < n.end);
        if (!node) { return null; }
        if (node.kind === ts.SyntaxKind.InterfaceDeclaration ||
            node.kind === ts.SyntaxKind.EnumDeclaration ||
            node.kind === ts.SyntaxKind.TypeAliasDeclaration) {
            return node.getChildren().find(n => ts.isIdentifier(n)) as ts.Identifier;
        }
        nodes = node.getChildren();
    }
    return null;
}

export function activate(context: vscode.ExtensionContext) {

    vscode.commands.registerCommand('extension.generateJSONSchema', () => {

        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage(`No active editor`);
            return;
        }

        const text = editor.document.getText();
        const sourceFile = ts.createSourceFile(editor.document.fileName, text, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
        const cursorPosition = editor.selection.active;
        const identifier = getIdentifierAtLocation(sourceFile, cursorPosition);

        if (!identifier) {
            vscode.window.showErrorMessage(`Couldn't find identifier at cursor position`);
            return;
        }

        const idName = identifier.escapedText.toString();

        vscode.window.withProgress({
            location: vscode.ProgressLocation.Window,
            title: `Generating JSON schema for ${idName}`,
            cancellable: false,
            },
            (progress, token) => {
                return vscode.workspace.findFiles('**/tsconfig.json', '**/node_modules/**', 1).then(files => {
                    if (!files.length) {
                        vscode.window.showErrorMessage(`No typescript project found.`);
                        return;
                    }
                    const sg = createGenerator({
                        path: files[0].fsPath,
                        expose: "export",
                        topRef: true,
                        jsDoc: "extended",
                        sortProps: true,
                        type: idName,
                    });
                    try {
                        const schema = sg.createSchema(idName);
                        vscode.workspace.openTextDocument({
                            content: JSON.stringify(schema, undefined, 2),
                            language: "json"
                        }).then(
                            document =>  vscode.window.showTextDocument(document),
                            reason =>  vscode.window.showInformationMessage(reason)
                        );
                    } catch (error) {
                        vscode.window.showErrorMessage(`Couldn't generate schema for ${idName}`);
                    }
                });
            });

    });

}