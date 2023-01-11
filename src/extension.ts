import * as vscode from 'vscode';

import childProcess = require('child_process');
import { TextDecoder, TextEncoder } from 'util';

function nCommands(n:number):string{
	return `${n} command${n === 1? "" : "s"}`;
}

function handleExecuteCommand(
	textEditor:vscode.TextEditor,
	onSuccess:(selection:vscode.Selection, command:string, stdout:string) => void,
	onError:(selection:vscode.Selection, command:string, stderr:string) => void,
	preprocess:(command:string)=>string = (cmd) => cmd
):void{
	const decoderUtf8 = new TextDecoder(); 

	textEditor.selections.forEach((selection)=>{
		let command = textEditor.document.getText(selection).trim();

		if(command === ""){
			return;
		}
		else{
			command = preprocess(command);
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

	if(!textEditor){
		return;
	}

	textEditor.edit((editBuffer)=>{
		vscode.window.showInformationMessage(`Executing ${nCommands(textEditor.selections.length)}`);
		outputChannel.show(true);

		handleExecuteCommand(
			textEditor,
			(selection, command, stdout) =>{
				outputChannel.append(`$${command}\n${stdout}\n\n`);
				editBuffer.replace(selection, stdout);
			},
			(_selection, command, stderr) => {
				outputChannel.append(`$${command}\n${stderr}\n\n`);
				vscode.window.showErrorMessage(`Feiled execution "${command}"`);
			}
		);
	});
}

function runCommand():void{
	const textEditor = vscode.window.activeTextEditor;
	const outputChannel = vscode.window.createOutputChannel("might-pipe");

	if(!textEditor){
		return;
	}

	vscode.window.showInformationMessage(`Running ${nCommands(textEditor.selections.length)}`);
	outputChannel.show(true);

	handleExecuteCommand(
		textEditor,
		(_selection, command, stdout) =>{
			outputChannel.append(`$${command}\n${stdout}\n\n`);
		},
		(_selection, command, stderr) => {
			outputChannel.append(`$${command}\n${stderr}\n\n`);
			vscode.window.showErrorMessage(`Feiled execution "${command}"`);
		}
	);
}

function pipe():void{
	vscode.window.showInputBox({
		title: "Pipe to command:",
	}).then((appToPipe)=>{
		if(!appToPipe){
			return;
		}
		const textEditor = vscode.window.activeTextEditor;
		const outputChannel = vscode.window.createOutputChannel("might-pipe");

		if(!textEditor){
			return;
		}

		textEditor.edit((editBuffer)=>{
			vscode.window.showInformationMessage(`Executing ${nCommands(textEditor.selections.length)}`);
			outputChannel.show(true);
	
			handleExecuteCommand(
				textEditor,
				(selection, command, stdout) =>{
					outputChannel.append(`$${command}\n${stdout}\n\n`);
					editBuffer.replace(selection, stdout);
				},
				(_selection, command, stderr) => {
					outputChannel.append(`$${command}\n${stderr}\n\n`);
					vscode.window.showErrorMessage(`Feiled execution "${command}"`);
				},
				(command) => `echo ${JSON.stringify(command)} | (${appToPipe})`
			);
		});
	});
}

function runPipe():void{
	vscode.window.showInputBox({
		title: "Pipe to command:",
	}).then((appToPipe)=>{
		if(!appToPipe){
			return;
		}
		const textEditor = vscode.window.activeTextEditor;
		const outputChannel = vscode.window.createOutputChannel("might-pipe");

		if(!textEditor){
			return;
		}

		vscode.window.showInformationMessage(`Running ${nCommands(textEditor.selections.length)}`);
		outputChannel.show(true);

		handleExecuteCommand(
			textEditor,
			(_selection, command, stdout) =>{
				outputChannel.append(`$${command}\n${stdout}\n\n`);
			},
			(_selection, command, stderr) => {
				outputChannel.append(`$${command}\n${stderr}\n\n`);
				vscode.window.showErrorMessage(`Feiled execution "${command}"`);
			},
			(command) => `echo ${JSON.stringify(command)} | (${appToPipe})`
		);
	});
}

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('might-pipe.execute_command', executeCommmand)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('might-pipe.run_command', runCommand)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('might-pipe.pipe', pipe)
	);
	context.subscriptions.push(
		vscode.commands.registerCommand('might-pipe.run_pipe', runPipe)
	);
}

export function deactivate() {}
