'use strict';

import * as vscode from 'vscode';
import * as ts from 'typescript';
import { createGenerator } from 'typescript-to-json-schema';

export default class TypeDefProvider implements vscode.CodeActionProvider {
	
	private static commandId: string = 'extension.generateJSONSchema';
    private diagnosticCollection!: vscode.DiagnosticCollection;
	private command!: vscode.Disposable;


	public activate(subscriptions: vscode.Disposable[]) {
		this.command = vscode.commands.registerCommand(TypeDefProvider.commandId, this.runCodeAction, this);
		subscriptions.push(this);
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection();

		vscode.workspace.onDidOpenTextDocument(this.findTypeDefs, this, subscriptions);
		vscode.workspace.onDidCloseTextDocument((textDocument)=> {
			this.diagnosticCollection.delete(textDocument.uri);
		}, null, subscriptions);

		vscode.workspace.onDidSaveTextDocument(this.findTypeDefs, this);

		// Hlint all open haskell documents
		vscode.workspace.textDocuments.forEach(this.findTypeDefs, this);
    }

	public dispose(): void {
		this.diagnosticCollection.clear();
		this.diagnosticCollection.dispose();
		this.command.dispose();
    }
    
	public provideCodeActions(
            document: vscode.TextDocument,
            range: vscode.Range,
            context: vscode.CodeActionContext,
            token: vscode.CancellationToken): vscode.Command[] {
		let diagnostic: vscode.Diagnostic = context.diagnostics[0];
		return [{
			title: `Generate JSON schema`,
			command: TypeDefProvider.commandId,
			arguments: [document, diagnostic.range, diagnostic.message]
		}];
	}
	
	private runCodeAction(document: vscode.TextDocument, range: vscode.Range, message:string): any {
        let idName:string = document.getText(range);

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
                            document => vscode.window.showTextDocument(document),
                            reason => vscode.window.showInformationMessage(reason)
                        );
                    } catch (error) {
                        vscode.window.showErrorMessage(`Couldn't generate schema for ${idName}`);
                    }
                });
            });

	}
	
	private findTypeDefs(textDocument: vscode.TextDocument) {
		if (textDocument.languageId !== 'typescript') { return; }

        let diagnostics: vscode.Diagnostic[] = [];
        
        const text = textDocument.getText();
        const sourceFile = ts.createSourceFile(textDocument.fileName, text, ts.ScriptTarget.ES2015, true, ts.ScriptKind.TS);
        const identifiers = this.getTypeDefIdentifiers(sourceFile);
        identifiers.forEach(i => {
            const startPos = ts.getLineAndCharacterOfPosition(sourceFile, i.getStart());
            const endPos = ts.getLineAndCharacterOfPosition(sourceFile, i.getEnd());
            const range = new vscode.Range(new vscode.Position(startPos.line, startPos.character), new vscode.Position(endPos.line, endPos.character));
            let diagnostic = new vscode.Diagnostic(range, `Generate JSON schema for ${i.escapedText.toString()}`, vscode.DiagnosticSeverity.Information);
            diagnostics.push(diagnostic);
        });
		this.diagnosticCollection.set(textDocument.uri, diagnostics);
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