import { displayName as appName } from '../../package.json';

import vscode from 'vscode';

export const logger = vscode.window.createOutputChannel(appName);
