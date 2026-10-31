# SVG CLI Editor

仓库地址：[https://github.com/wangjr20210114-hue/svg-cli-lab1](https://github.com/wangjr20210114-hue/svg-cli-lab1)

通过命令行创建和编辑 SVG 图形，支持分组、撤销重做及文件保存读回。保存的 `.svg` 文件可以直接用浏览器打开。

## 1. 安装与启动

需要 Node.js 22 或以上版本。首次使用，在 Windows PowerShell 中依次执行：

```powershell
git clone https://github.com/wangjr20210114-hue/svg-cli-lab1.git
cd svg-cli-lab1
npm.cmd ci
npm.cmd run cli
```

如果已经下载项目，进入项目目录后执行最后两条即可。macOS/Linux 将 `npm.cmd` 换成 `npm`。

启动成功后显示：

```text
svg-editor 0.1 — type 'help' for commands
svg>
```

下面的编辑命令都输入到 `svg>` 中，可以整段粘贴，不需要输入提示符。包含空格的文本或文件路径使用双引号；以 `#` 开头的整行是注释。Windows 按 Ctrl+Z 后 Enter 退出，macOS/Linux 按 Ctrl+D 退出。

## 2. 直接粘贴：绘制并保存流程图

```text
init 800 600
create g flowchart
create g node1 in flowchart
create rect start 120 100 160 60 #4a90d9 in node1
create text start-label 155 135 "开始" in node1
create g node2 in flowchart
create rect process 520 100 160 60 #f5a623 in node2
create text process-label 545 135 "处理数据" in node2
create line arrow1 280 130 520 130 black in flowchart
set process-label text "处理数据 v2"
tree
save flowchart.svg
```

结果：

- 创建 800×600 画布，包含两个带中文文字的矩形节点和一条连线。
- `tree` 显示 flowchart、node1、node2 的嵌套关系以及各图形的坐标。
- `save` 输出 `saved to flowchart.svg (8 elements)`，文件保存在启动程序的目录中。
- 用 Edge、Chrome 或 Firefox 打开 `flowchart.svg`，可以看到下图。

![流程图效果](doc/flowchart-preview.png)

也可以在 PowerShell 中直接回放同类示例：

```powershell
npm.cmd run demo
```

该命令会生成 `flowchart.svg`，不需要手动逐行输入。

## 3. 移动、缩放、修改属性、撤销重做

完成上一节后，在同一个 `svg>` 会话继续粘贴：

```text
move node2 0 100
show process
undo
show process
redo
show process
scale start 0.5
show start
undo
set start fill #22c55e
set start-label text "新的开始"
show start-label
```

| 命令 | 结果 |
|---|---|
| `move node2 0 100` | 整个 node2 下移 100，包括矩形和文字；随后 show 的 process 为 `y=200` |
| `undo` | 撤销移动，随后 process 为 `y=100` |
| `redo` | 重做移动，随后 process 为 `y=200` |
| `scale start 0.5` | 矩形的位置和尺寸均减半：`x=60 y=50 width=80 height=30` |
| 缩放后的 `undo` | 恢复 start 的原始位置和尺寸 |
| `set start fill #22c55e` | 将 start 的填充色改为绿色 |
| `set start-label text "新的开始"` | 修改文字内容；show 会显示新内容 |

每条成功的编辑命令可撤销一次。undo 后执行新的成功编辑，会清空 redo；显示命令不占用历史记录。修改后需要再次保存文件，浏览器刷新后才会显示新效果。

## 4. 创建六种图形

下面是一段独立示例。`init` 会将当前文档替换为新画布：

```text
init 600 400
create g shapes
create rect r1 20 20 120 60 #4a90d9 in shapes
create circle c1 220 50 30 red in shapes
create ellipse e1 340 50 50 25 orange in shapes
create line l1 20 150 400 150 black in shapes
create text t1 20 190 "Hello SVG 中文" in shapes
tree
```

结果：shapes 容器内包含矩形、圆、椭圆、直线和文字。省略 `in shapes` 时，图形直接放在画布根级。

| 类型 | 创建格式 | 参数含义 |
|---|---|---|
| 矩形 | `create rect <id> <x> <y> <w> <h> [fill]` | 左上角坐标、宽、高、可选填充色 |
| 圆 | `create circle <id> <cx> <cy> <r> [fill]` | 圆心坐标、半径、可选填充色 |
| 椭圆 | `create ellipse <id> <cx> <cy> <rx> <ry> [fill]` | 中心坐标、两个半径、可选填充色 |
| 直线 | `create line <id> <x1> <y1> <x2> <y2> [stroke]` | 两个端点坐标、可选描边色 |
| 文字 | `create text <id> <x> <y> "content"` | 坐标和文字内容 |
| 容器 | `create g <id>` | 创建空分组，可通过 in 或 addto 放入图形 |

ID 必须唯一，且区分大小写；坐标和尺寸支持小数。颜色可用 `red`、`black` 或 `#4a90d9` 等 SVG 颜色值。省略颜色时遵循 SVG 默认样式。

## 5. 分组、解组、调整顺序和删除

下面也是独立示例，可以整段粘贴：

```text
init 800 600
create g scene
create rect r1 20 20 100 60 blue
create circle c1 70 50 30 red
group pair r1 c1
addto scene pair
tree scene
ungroup pair
tree scene
front r1
back r1
delete c1
undo
tree scene
```

| 命令 | 结果 |
|---|---|
| `group pair r1 c1` | 新建 pair，收入已有的矩形和圆 |
| `addto scene pair` | 将 pair 移入 scene，成为其最后一个子节点 |
| 第一次 `tree scene` | 显示 scene → pair → r1、c1 的层级 |
| `ungroup pair` | 删除 pair 容器，将 r1、c1 提升为 scene 的直接子节点 |
| `front r1` | r1 移到同级最前景，覆盖重叠的 c1 |
| `back r1` | r1 移到同级最后景，重叠处由 c1 覆盖 |
| `delete c1` | 删除圆 |
| 删除后的 `undo` | 恢复圆及其原来的同级位置 |

直接位于画布根级的容器不能 ungroup。删除容器会同时删除其全部子孙；一次 undo 可以整体恢复。

## 6. 查看画布与保存、读回文件

接上一节，在 `svg>` 中粘贴：

```text
canvas
canvas 400 300
save shapes.svg
save
read shapes.svg
tree
show r1
help
```

| 命令 | 结果 |
|---|---|
| `canvas` | 显示当前画布尺寸，上一节的画布为 800×600 |
| `canvas 400 300` | 将画布尺寸改为 400×300 |
| `save shapes.svg` | 保存当前文档 |
| `save` | 继续保存到上一次指定的 shapes.svg |
| `read shapes.svg` | 从文件读回文档，替换当前文档 |
| `tree` / `tree <id>` | 显示全文档／指定图形的结构树 |
| `show r1` | 显示 r1 的父级、坐标、尺寸和样式 |
| `help` | 显示全部命令的语法 |

路径包含空格时使用双引号，例如 `save "my drawing.svg"`。init、read、save 及修改画布尺寸成功后，undo/redo 会被禁止，直到下一次成功的编辑命令。

导入缺少 ID 的图形时，会自动补充并输出警告。本版本支持上述六种图形和规定属性；transform、path 等超出导入范围的内容会明确报错。

## 7. 错误提示与自动检查

接上一节，可以输入以下命令检查错误处理：

| 输入命令 | 预期提示 |
|---|---|
| `create rect r1 0 0 10 10` | `error: id already exists: r1` |
| `scale r1 0` | `error: scale factor must be positive` |
| `set r1 unknown 123` | `error: unknown attribute: unknown` |
| `show missing` | `error: no such shape: missing` |
| `undo` | `error: undo not allowed after io command` |

这些失败操作不会改变文档和编辑历史。返回 PowerShell 后，可运行完整自动检查：

```powershell
npm.cmd run verify
```

通过时会显示架构检查通过，以及 `tests 39`、`pass 39`、`fail 0`。
