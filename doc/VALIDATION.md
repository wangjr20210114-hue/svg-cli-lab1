# 验证记录

日期：2026-10-30，Asia/Shanghai。功能验收提交：`45a1405`；后续 F13 仅更新文档与预览图，不改变运行代码。

## 实际结果

| 环境／入口 | 结果 |
|---|---|
| 本地 Windows、Node 24.19.0、npm 11.17.0：`npm run verify` | 编译通过，架构检查通过，39/39 测试通过 |
| GitHub Actions：Ubuntu、Node 22 | npm ci 与完整 verify 均通过 |
| GitHub Actions：Windows、Node 24 | npm ci 与完整 verify 均通过 |
| 正式演示入口：`npm run demo` | 流程图成功导出，8 个元素，无错误 |
| 导出 SVG 的本地渲染检查 | 两个彩色节点、中文、连线与撤销后的几何正确；预览见 flowchart-preview.png |

CI 证据：[41002837466](https://github.com/wangjr20210114-hue/svg-cli-lab1/actions/runs/41002837466)。测试中使用独立临时目录；清理前检查目录属于专用测试前缀。

沙箱曾因 Windows rename 权限导致覆盖测试 EPERM；该限制没有通过删除测试或先删旧文件规避。正常本地环境与 Windows CI 均验证了原子替换流程。

## 测试组成

| 层级 | 文件与测试数量 |
|---|---|
| 单元 20 | Document 5、Shapes 5、Tokenizer 4、History 3、Presentation 3 |
| 集成 14 | EditCommands 3、Structure 4、Svg 4、DocumentCommands 2、Atomicity 1 |
| 端到端 5 | Cli：完整入口、流程图、错误恢复、完整主会话、失败导入不改变文档与 redo |

## 对初始验收矩阵 T01—T25 的映射

以下均由已执行测试覆盖；每行是一组需求场景，不等同于一个测试函数。

| 场景 | 覆盖文件／证据 | 结果 |
|---|---|---|
| T01 六种类型、小数、省略颜色 | Shapes、EditCommands、Svg | 通过 |
| T02 唯一且大小写敏感 ID | Document | 通过 |
| T03 create in 归属与错误 | Document、EditCommands、Cli | 通过 |
| T04 引号、中文、in、颜色 | Tokenizer、Cli | 通过 |
| T05 三层嵌套移动缩放 | Shapes | 通过 |
| T06 非正／非有限缩放 | Shapes、EditCommands、Atomicity | 通过 |
| T07 属性白名单及非法属性 | Shapes、EditCommands、Cli | 通过 |
| T08 删除容器恢复整棵子树 | Document、EditCommands | 通过 |
| T09 分组单元、跨父级与顺序 | Structure | 通过 |
| T10 容器与后代同时分组 | Structure、Cli | 通过 |
| T11 addto 自身／后代 | Structure | 通过 |
| T12 合法解组与根级拒绝 | Structure | 通过 |
| T13 front/back 与原位置恢复 | Structure | 通过 |
| T14 连续 undo/redo | History、EditCommands | 通过 |
| T15 新编辑清 redo、失败保留 | History、EditCommands、Cli | 通过 |
| T16 IO 屏障及查询不改变历史 | History、DocumentCommands、Cli | 通过 |
| T17 缺 ID 自动补号并避让 | Svg、Cli | 通过 |
| T18 非法导入和读写失败保留状态 | Svg、DocumentCommands、Cli | 通过 |
| T19 嵌套保存读回 | Svg、Cli | 通过 |
| T20 XML 特殊字符与中文 | Svg | 通过 |
| T21 tree/show/help 与错误文案 | Presentation、Cli | 通过 |
| T22 无文档错误 | EditCommands、Cli | 通过 |
| T23 附件两份必做会话 | Cli、examples/basic.txt、examples/flowchart.txt | 通过 |
| T24 可视检查 | 实际导出 flowchart.svg 的渲染预览 | 通过本地渲染；未把它冒称为手动浏览器操作 |
| T25 box 等未知类型拒绝 | EditCommands、Cli | 通过 |

## 如何再次执行

```sh
npm ci
npm run verify
npm run demo
npm run cli
```

最后在浏览器打开生成的 `flowchart.svg`。Windows PowerShell 可将 npm 写为 npm.cmd。单独运行测试可使用 `test:unit`、`test:integration`、`test:e2e`；架构检查为 `check:deps`。

预期：verify 结束显示 39 个测试、0 失败。demo 生成两个节点的流程图。basic 演示中的两条错误是附件故意安排的用例，不代表验收失败。

## 边界

本项目实现 Phase 1 的六种图形与规定属性。SVG 的 transform、任意扩展属性、path、复杂文本等超出当前导入子集时明确拒绝；不会静默丢弃再返回成功。跨父级分组及未完全指定的命令细节见 README 的实现约定。
