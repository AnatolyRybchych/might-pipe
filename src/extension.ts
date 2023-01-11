import * as vscode from 'vscode';

import childProcess = require('child_process');
import { TextDecoder, TextEncoder } from 'util';

function executeCommmand():Promise<void>{
	return new Promise(()=>{
		const textEditor = vscode.window.activeTextEditor;
		const decoderUtf8 = new TextDecoder(); 
		const showErrorMessage = vscode.window.showErrorMessage;
		const outputChannel = vscode.window.createOutputChannel("might-pipe");

		if(!textEditor){
			return;
		}

		textEditor.edit((editBuffer)=>{
			textEditor.selections.forEach((selection)=>{
				const text = textEditor.document.getText(selection).trim();

				if(text === ""){
					return;
				}
				outputChannel.show(true);
				outputChannel.append(`$${text}\n\n`);
				try {
					const proc = childProcess.execSync(text);
					const procOutput = decoderUtf8.decode(proc.buffer).trim();

					editBuffer.replace(selection, procOutput);

					outputChannel.append(`${procOutput}\n\n`);

				} catch (error) {
					showErrorMessage(`Feiled execution "${text}"`);
					outputChannel.append(`${error}\n\n`);
				}
			});
		});
	});
}

export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('might-pipe.execute_commmand', executeCommmand);

	context.subscriptions.push(disposable);
}

export function deactivate() {}
