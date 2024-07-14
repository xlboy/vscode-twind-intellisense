import { logger } from './logger';
import type { TwindConfig } from '@twind/core';
import { createConfigLoader } from 'unconfig';
import vscode from 'vscode';

export interface ExtensionConfig {
  /** @default true */
  enabled: boolean;

  /** @default ['tw', 'className', 'class'] */
  attributes: string[];

  /** @default `${workspaceFolder}` */
  // rootPath: string;

  /** @default `${workspaceFolder}/twind.config.js` */
  // configPath: string;
}

export class Configurator {
  private static _instance: Configurator;
  private _extensionConfig!: ExtensionConfig;
  private _twindUserConfig?: TwindConfig;
  private _watchExtensionConfigCallbacks: Function[] = [];

  constructor() {
    this._syncExtensionConfig();
    this._syncTwindUserConfig();

    vscode.workspace.onDidChangeConfiguration(() => {
      this._watchExtensionConfigCallbacks.forEach(cb => cb());
    });
  }

  static get i() {
    return Configurator._instance || (Configurator._instance = new Configurator());
  }

  getExtensionConfig() {
    return this._extensionConfig;
  }

  getTwindUserConfig() {
    return this._twindUserConfig;
  }

  onWatchExtensionConfig(cb: Function) {
    this._watchExtensionConfigCallbacks.push(cb);
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
      cwd: this._utils.getWorkspaceFolder(),
      defaults: {},
      sources: { files: 'twind.config' },
    });

    const { config, sources } = await twindConfigLoader.load();
    if (sources.length === 0) {
      logger.appendLine('Twind config not found');
      return;
    }
    
    this._twindUserConfig = config;
  }

  private _utils = {
    getWorkspaceFolder: () => vscode.workspace.workspaceFolders?.[0]?.uri.fsPath,
  };
}
