import * as vscode from 'vscode'; 

import SchemaGenerator from './SchemaGenerator';

export function activate(context: vscode.ExtensionContext) {
    let provider = new SchemaGenerator();
	provider.activate(context);
}