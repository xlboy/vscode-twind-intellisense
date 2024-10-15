export type TwindDefaultPreset =
  | 'tailwind'
  | 'phoenix-tailwind@3.4'
  | 'tailwind-forms'
  | 'autoprefix'
  | 'container-queries'
  | 'line-clamp'
  | 'radix-ui'
  | 'typography';

export interface ExtensionConfig {
  /** @default true */
  enabled: boolean;

  /** @default ['tailwind'] */
  presets: TwindDefaultPreset[];

  /**
   * Path to the Twind configuration file.
   * 
   * This should be specified relative to the workspace root.
   * 
   * Options:
   * 1. Full path to the config file: e.g., `'path/to/twind.config.js'`
   * 2. Directory containing the config file: e.g., `'path/to/'`
   *    (will automatically look for `twind.config.js` or `twind.config.ts`)
   * 3. Leave empty to use default: `<workspaceRoot>/twind.config.(js|ts)`
   *
   * Note: Always use forward slashes (`/`) for paths, even on Windows.
   */
  configPath?: string;

  colorPreview: {
    /**
     * @default true
     */
    enabled: boolean;
  };

  classExtraction?: {
    /**
     * @example
     * ```ts
     * ['class(Name)?=']
     * ```
     */
    prefixes?: string[];
    /**
     * @example
     * ```ts
     * ['css(?=`|\()']
     * ```
     */
    ignorePrefixes?: string[];
  };
}
