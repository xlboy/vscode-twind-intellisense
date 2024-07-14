# VSCode Twind Intellisense (Phoenix)

English | [简体中文](./README.zh.md)

## Its story

## Features

## 执行计划

1. UserConfig Module

> 管理用户配置

```ts
interface UserConfig {
  extension: {};
  twind: {};
};
```

2. TwindIntellisense Module

> 依赖 `UserConfig`；管理 `TwindIntellisense` 及对外服务

```ts
interface TwindIntellisense {
  init(config: UserConfig): void;
  update(config: UserConfig): void;
  suggestAt(doc: Document, offset: number): void;
  hoverAt(doc: Document, offset: number): void;
};
```

3. Command Module

> 管理 Command

4. Logger Module

> 管理日志
