import { version } from '../package.json';
import { Configurator } from './core/configurator';
import { Controller } from './core/controller';
import { logger } from './core/logger';
import vscode from 'vscode';

export function activate(vscodeContext: vscode.ExtensionContext) {
  logger.appendLine(`Extension version: v${version}\n`);

  const extensionConfig = Configurator.i.getExtensionConfig();
  if (!extensionConfig.enabled) {
    logger.appendLine('Extension disabled, exiting...');

    return;
  }

  new Controller();
}
