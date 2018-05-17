import * as vscode from 'vscode'; 

import TypeDefProvider from './typeDefProvider';

export function activate(context: vscode.ExtensionContext) {
	let provider = new TypeDefProvider();	
	provider.activate(context.subscriptions);
	vscode.languages.registerCodeActionsProvider('typescript', provider);
}