import { logger } from './logger';
import type { ExtensionConfig } from './types';
import type { TwindUserConfig } from '@twind/core';
import { getRootPath } from '@vscode-use/utils';
import fs from 'fs-extra';
import path from 'path';
import { createConfigLoader } from 'unconfig';
import vscode from 'vscode';

class Configurator {
  private _extensionConfig!: ExtensionConfig;
  private _twindUserConfig?: TwindUserConfig;
  private _watchExtensionConfigCallbacks: Array<(config: ExtensionConfig) => void> = [];
  private _watchTwindUserConfigCallbacks: Array<(config: TwindUserConfig) => void> = [];
  private _vscodeContext!: vscode.ExtensionContext;

  init(vscodeContext: vscode.ExtensionContext) {
    this._vscodeContext = vscodeContext;

    this._syncExtensionConfig();
    this._syncTwindUserConfig();
    this._listenConfigFileChange();
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
      configPath: config.get('configPath', undefined),
      colorPreview: {
        enabled: config.get('colorPreview.enabled', true),
      },
      classExtraction: config.get('classExtraction', {}),
    };

    this._watchExtensionConfigCallbacks.forEach(cb => cb(this._extensionConfig));
  }

  private _syncTwindUserConfig = async () => {
    const twindConfigLoader = createConfigLoader<TwindUserConfig>(
      (() => {
        let { configPath: twindConfigPath } = this._extensionConfig;
        const workspaceFolder = getRootPath()!;

        if (!twindConfigPath) return { cwd: workspaceFolder, sources: { files: 'twind.config' } };

        twindConfigPath = path.normalize(path.resolve(workspaceFolder, twindConfigPath));

        if (!fs.existsSync(twindConfigPath)) {
          logger.warn(`Specified config path does not exist: ${twindConfigPath}`);
          return { cwd: workspaceFolder, sources: { files: 'twind.config' } };
        }

        if (fs.lstatSync(twindConfigPath).isDirectory()) {
          return { cwd: twindConfigPath, sources: { files: 'twind.config' } };
        }

        return { sources: { files: twindConfigPath } };
      })(),
    );

    const { config, sources } = await twindConfigLoader.load();
    if (sources.length === 0) {
      logger.error('Twind config not found');
      return;
    }

    logger.info(`Twind config loaded from ${sources[0]}`);

    this._twindUserConfig = config;
    this._watchTwindUserConfigCallbacks.forEach(cb => cb(config));
  };

  private _listenConfigFileChange() {
    vscode.workspace.onDidChangeConfiguration(() => {
      this._syncExtensionConfig();
      this._syncTwindUserConfig();
    });
  }
}

export const configurator = new Configurator();
