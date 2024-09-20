# 0.5.0 (2024-09-20)

## Added

- Support for `phoenix-tailwind@3.4` (compatible with the latest `tailwind@3.4`)

# 0.4.0 (2024-08-16)

## Added

- Added the `classExtraction` configuration option

## Changed

- When triggering suggestions, error logs are no longer output if no relevant results are found

- Upgraded `@phoenix-twind/intellisense` to version `1.1.4-alpha.4`, bringing the following improvements:

  - Added `ignorePrefixes` to class extraction, ensuring compatibility when using `` css`...` `` inside `tw(...)`

# 0.3.0 (2024-08-13)

Upgrade `@phoenix-twind/intellisense`, with the following changes:

- [BUG] Fixed multiple duplicates issue when triggering suggestions (https://github.com/xlboy/twind/commit/1cd784c946a9ecd093b87296aaa8ff62e3b2fe5a)

- [BUG] Fixed line break issue in hover content display (https://github.com/xlboy/twind/pull/4#discussion_r1714110841)

- [Pref] Optimized hover performance (https://github.com/xlboy/twind/pull/7)

# 0.2.0 (2024-08-11)

- refactor: rewrite `colorPreview`

- feat: support `ts|tsx|js|jsx`

# 0.1.0 (2024-07-20)

First release
