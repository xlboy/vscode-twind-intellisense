import { displayName as appName } from '../../package.json';
import vscode from 'vscode';

class Logger {
  private _channel = vscode.window.createOutputChannel(appName);

  constructor() {}

  error(message: string) {
    this._channel.appendLine(`❌ [${this._getTime()}] ${message}`);
  }

  warn(message: string) {
    this._channel.appendLine(`⚠️ [${this._getTime()}] ${message}`);
  }

  info(message: string) {
    this._channel.appendLine(`📋 [${this._getTime()}] ${message}`);
  }

  private _getTime = () => new Date().toLocaleString();
}

export const logger = new Logger();
