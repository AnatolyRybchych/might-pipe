import * as vscode from 'vscode';

import childProcess = require('child_process');
import { TextDecoder, TextEncoder } from 'util';

function nCommands(n:number):string{
	return `${n} command${n === 1? "" : "s"}`;
}

function executeCommmand():void{
	const textEditor = vscode.window.activeTextEditor;
	const decoderUtf8 = new TextDecoder(); 
	const showErrorMessage = vscode.window.showErrorMessage;
	const showInformationMessage = vscode.window.showInformationMessage;
	const outputChannel = vscode.window.createOutputChannel("might-pipe");

	if(!textEditor){
		return;
	}

	showInformationMessage(`Executing ${nCommands(textEditor.selections.length)}`);

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
}

function runCommand():void{
	
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('might-pipe.execute_commmand', executeCommmand)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('might-pipe.run_command', executeCommmand)
	);
}

export function deactivate() {}
