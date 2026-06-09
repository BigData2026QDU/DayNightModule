# File_Index.md — 文件索引

## 根目录

| 文件 | 作用 |
|------|------|
| `Architecture.md` | 项目架构说明文档 |
| `README.md` | 项目简介及使用说明 |
| `File_Index.md` | 文件索引（本文件） |
| `.gitignore` | Git 忽略规则 |

## DayNightModule/modules/theme/

| 文件 | 作用 |
|------|------|
| `theme.css` | 日间/夜间主题样式文件。定义两套 CSS 自定义属性（`:root` 日间、`[data-theme="night"]` 夜间），包含颜色变量、主题切换按钮样式、`prefers-reduced-motion` 支持。不定义通用组件样式，由使用者按需消费变量 |
| `theme-manager.js` | 主题管理器。提供自动时间判断、手动切换、localStorage 持久化、切换按钮自动挂载、自定义事件派发、跨午夜时间区间支持、`destroy()` 完整清理等功能 |

## AGENTS/

| 文件 | 作用 |
|------|------|
| `AGENTS.md` | 学期项目仓库规范文档 |
| `CLAUDE.md` | Claude Code 项目配置 |
| `.gitignore` | Git 忽略规则 |
