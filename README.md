# SVG CLI Editor — Lab1 Phase 1

公共仓库：https://github.com/wangjr20210114-hue/svg-cli-lab1

TypeScript 面向对象 SVG 编辑器：六种图形、19 条命令、分组与层级、撤销重做、SVG 保存读回。

**作业提交文档：[doc/README.md](doc/README.md)**，包含架构图、模块设计模式、真实开发记录、自查与测试维护方法。

```sh
npm ci
npm run verify
npm run cli
```

- `npm run verify`：编译、架构检查、39 项自动测试。
- `npm run demo`：回放附件流程图案例，生成 flowchart.svg，浏览器可直接打开。
- `npm run demo:basic`：主会话回放，含两条预期错误。
- `npm run test:unit` / `test:integration` / `test:e2e`：分别运行各层测试。
- Windows PowerShell 可用 `npm.cmd` 替代 `npm`；需要 Node.js >=22。

![实际导出流程图](doc/flowchart-preview.png)

[分功能进度](doc/PROGRESS.md) · [验证记录](doc/VALIDATION.md) · [开发前设计](doc/DESIGN.md)
