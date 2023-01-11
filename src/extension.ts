import * as vscode from 'vscode';

import childProcess = require('child_process');
import { TextDecoder, TextEncoder } from 'util';

function nCommands(n:number):string{
	return `${n} command${n === 1? "" : "s"}`;
}

function handleExecuteCommand(
	textEditor:vscode.TextEditor,
	onSuccess:(selection:vscode.Selection, command:string, stdout:string) => void,
	onError:(selection:vscode.Selection, command:string, stderr:string) => void
):void{
	const decoderUtf8 = new TextDecoder(); 

	textEditor.selections.forEach((selection)=>{
		const command = textEditor.document.getText(selection).trim();

		if(command === ""){
			return;
		}
		
		try {
			const proc = childProcess.execSync(command);
			const procOutput = decoderUtf8.decode(proc.buffer);

			onSuccess(selection, command, procOutput);
		} catch (error) {
			onError(selection, command, `${error}`);
		}
	});
	
}

function executeCommmand():void{
	const textEditor = vscode.window.activeTextEditor;
	const outputChannel = vscode.window.createOutputChannel("might-pipe");
	const showErrorMessage = vscode.window.showErrorMessage;
	const showInformationMessage = vscode.window.showInformationMessage;

	if(!textEditor){
		return;
	}

	textEditor.edit((editBuffer)=>{
		showInformationMessage(`Executing ${nCommands(textEditor.selections.length)}`);
		outputChannel.show(true);

		handleExecuteCommand(
			textEditor,
			(selection, command, stdout) =>{
				outputChannel.append(`$${command}\n\n${stdout}\n\n`);
				editBuffer.replace(selection, stdout);
			},
			(_selection, command, stderr) => {
				outputChannel.append(`$${command}\n\n${stderr}\n\n`);
				showErrorMessage(`Feiled execution "${command}"`);
			}
		);
	});
}

function runCommand():void{
	const textEditor = vscode.window.activeTextEditor;
	const outputChannel = vscode.window.createOutputChannel("might-pipe");
	const showErrorMessage = vscode.window.showErrorMessage;
	const showInformationMessage = vscode.window.showInformationMessage;

	if(!textEditor){
		return;
	}

	showInformationMessage(`Running ${nCommands(textEditor.selections.length)}`);
	outputChannel.show(true);

	handleExecuteCommand(
		textEditor,
		(_selection, command, stdout) =>{
			outputChannel.append(`$${command}\n${stdout}\n\n`);
		},
		(_selection, command, stderr) => {
			outputChannel.append(`$${command}\n${stderr}\n\n`);
			showErrorMessage(`Feiled execution "${command}"`);
		}
	);
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('might-pipe.execute_command', executeCommmand)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('might-pipe.run_command', runCommand)
	);
}

export function deactivate() {}
