'use strict';

import * as vscode from 'vscode';
import * as ts from 'typescript';
import { createGenerator, SchemaGenerator as SG } from 'ts-json-schema-generator';

export default class SchemaGenerator {

	
	private static commandId: string = 'extension.generateJSONSchema';

	public activate(context: vscode.ExtensionContext) {
		vscode.commands.registerTextEditorCommand(SchemaGenerator.commandId, this.runCommand, this);
    }
	
	private async runCommand(textEditor: vscode.TextEditor, edit: vscode.TextEditorEdit) {
        const textDocument = textEditor.document;
        if (textDocument.languageId !== 'typescript') {
            vscode.window.showErrorMessage(`Can generate schemas only from Typescript projects`);
            return;
        }

        const text = textDocument.getText();
        const sourceFile = ts.createSourceFile(textDocument.fileName, text, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
        const identifiers = this.getTypeDefIdentifiers(sourceFile);
        const idNames = identifiers.map(i => i.escapedText.toString());

        const selected = await vscode.window.showQuickPick(idNames);
        if (!selected) { return; }
        this.startGeneratingSchema(selected);
    }

    private startGeneratingSchema(idName: string) {
        const progressConfig = {
            location: vscode.ProgressLocation.Window,
            title: `Generating JSON schema for ${idName}`,
            cancellable: false,
        };

        vscode.window.withProgress(progressConfig, (progress, token) => this.generateSchema(idName)).then(
            textEditor => {},
            reason => vscode.window.showErrorMessage(reason)
        );
    }

    private async generateSchema(idName: string) {

        const files = await vscode.workspace.findFiles('**/tsconfig.json', '**/node_modules/**', 1);

        if (!files.length) {
            vscode.window.showErrorMessage(`No typescript project found.`);
            return;
        }

        const config = vscode.workspace.getConfiguration('vscode-typescript-to-json-schema');

        let schemaGenerator: SG;
        try {
            schemaGenerator = createGenerator({
                path: files[0].fsPath,
                expose: config.get<"all"|"none"|"export">("generateJSONSchema.expose", "export"),
                topRef: config.get<boolean>("generateJSONSchema.topRef", true),
                jsDoc: config.get<"none"|"extended"|"basic">("generateJSONSchema.jsDoc", "basic"),
                sortProps: config.get<boolean>("generateJSONSchema.sortProps", true),
                type: idName,
            });
        } catch (error) {
            vscode.window.showErrorMessage(`Couldn't generate schema because program has errors`);
            return;
        }
            
        try {
            const schema = schemaGenerator.createSchema(idName);
            const newDocument = await vscode.workspace.openTextDocument({
                content: JSON.stringify(schema, undefined, 4),
                language: "json"
            });
            return vscode.window.showTextDocument(newDocument);
        } catch (error) {
            vscode.window.showErrorMessage(`Couldn't generate schema for ${idName}: ${(error as Error).message}`);
        }
    }
    
    private getTypeDefIdentifiers(sourceFile: ts.SourceFile): ts.Identifier[] {
        function getIdsFromNode(n: ts.Node | ts.SourceFile): ts.Identifier[] {
            const ids: ts.Identifier[] = [];
            n.getChildren().forEach(n => {
                if (n.kind === ts.SyntaxKind.InterfaceDeclaration ||
                    n.kind === ts.SyntaxKind.EnumDeclaration ||
                    n.kind === ts.SyntaxKind.TypeAliasDeclaration) {
                        ids.push(n.getChildren().find(n => ts.isIdentifier(n)) as ts.Identifier);
                } else {
                    ids.push(...getIdsFromNode(n));
                }
            });
            return ids;
        }
        return getIdsFromNode(sourceFile);
    }

}