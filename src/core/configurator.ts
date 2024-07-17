import { logger } from './logger';
import type { ExtensionConfig } from './types';
import type { TwindUserConfig } from '@twind/core';
import { getRootPath } from '@vscode-use/utils';
import { createConfigLoader } from 'unconfig';
import vscode from 'vscode';

class Configurator {
  private _extensionConfig!: ExtensionConfig;
  private _twindUserConfig?: TwindUserConfig;
  private _watchExtensionConfigCallbacks: Array<(config: ExtensionConfig) => void> = [];
  private _watchTwindUserConfigCallbacks: Array<(config: TwindUserConfig) => void> = [];

  constructor() {
    this._syncExtensionConfig();
    this._syncTwindUserConfig();

    vscode.workspace.onDidChangeConfiguration(() => {
      this._syncExtensionConfig();
      this._watchExtensionConfigCallbacks.forEach(cb => cb(this._extensionConfig));
    });
    // TODO: TwindUserConfig 也可以监听一下哇
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

  onWatchTwindUserConfig(cb: (config: TwindUserConfig) => void) {
    this._watchTwindUserConfigCallbacks.push(cb);
  }

  private _syncExtensionConfig() {
    const config = vscode.workspace.getConfiguration('twind-intellisense');

    this._extensionConfig = {
      enabled: config.get('enabled', true),
      presets: config.get('presets', ['tailwind']),
      // attributes: config.get('attributes', ['tw', 'className', 'class']),
      // rootPath: config.get('rootPath', ''),
      // configPath: config.get('configPath', ''),
    } satisfies ExtensionConfig;
  }

  private async _syncTwindUserConfig() {
    const twindConfigLoader = createConfigLoader<TwindUserConfig>({
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
