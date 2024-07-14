import { logger } from './logger';
import type { TwindConfig } from '@twind/core';
import { getRootPath } from '@vscode-use/utils';
import { createConfigLoader } from 'unconfig';
import vscode from 'vscode';

interface ExtensionConfig {
  /** @default true */
  enabled: boolean;

  /** @default ['tw', 'className', 'class'] */
  attributes: string[];

  /** @default `${workspaceFolder}` */
  // rootPath: string;

  /** @default `${workspaceFolder}/twind.config.js` */
  // configPath: string;
}

class Configurator {
  private _extensionConfig!: ExtensionConfig;
  private _twindUserConfig?: TwindConfig;
  private _watchExtensionConfigCallbacks: Array<(config: ExtensionConfig) => void> = [];
  private _watchTwindUserConfigCallbacks: Array<(config: TwindConfig) => void> = [];

  constructor() {
    this._syncExtensionConfig();
    this._syncTwindUserConfig();

    vscode.workspace.onDidChangeConfiguration(() => {
      this._watchExtensionConfigCallbacks.forEach(cb => cb(this._extensionConfig));
    });
  }

  getExtensionConfig() {
    return this._extensionConfig;
  }

  getTwindUserConfig() {
    return this._twindUserConfig;
  }

  onWatchExtensionConfig(cb: (config: ExtensionConfig) => void) {
    this._watchExtensionConfigCallbacks.push(cb);
  }

  onWatchTwindUserConfig(cb: (config: TwindConfig) => void) {
    this._watchTwindUserConfigCallbacks.push(cb);
  }

  private _syncExtensionConfig() {
    const config = vscode.workspace.getConfiguration('twind');

    this._extensionConfig = {
      enabled: config.get('enabled', true),
      attributes: config.get('attributes', ['tw', 'className', 'class']),
      // rootPath: config.get('rootPath', ''),
      // configPath: config.get('configPath', ''),
    } satisfies ExtensionConfig;
  }

  private async _syncTwindUserConfig() {
    const twindConfigLoader = createConfigLoader<TwindConfig>({
      cwd: getRootPath(),
      defaults: {},
      sources: { files: 'twind.config' },
    });

    const { config, sources } = await twindConfigLoader.load();
    if (sources.length === 0) {
      logger.error('Twind config not found');
      return;
    }

    logger.info(`Twind config loaded from ${sources[0]}`);

    this._twindUserConfig = config;
    this._watchTwindUserConfigCallbacks.forEach(cb => cb(config));
  }
}

export const configurator = new Configurator();
