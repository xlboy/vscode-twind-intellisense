import { version } from '../package.json';
import { configurator } from './core/configurator';
import { Controller } from './core/controller';
import { logger } from './core/logger';
import vscode from 'vscode';

export function activate(vscodeContext: vscode.ExtensionContext) {
  logger.info(`Extension version: v${version}\n`);

  const extensionConfig = configurator.getExtensionConfig();
  if (!extensionConfig.enabled) {
    logger.info('Extension disabled, exiting...');

    return;
  }

  new Controller(vscodeContext);
}
