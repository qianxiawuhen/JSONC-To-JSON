# JSONC to JSON Converter

一个简单的命令行工具，用于将 JSONC（带注释的 JSON）文件转换为标准 JSON 格式。
A simple command-line tool to convert JSONC (JSON with Comments) files to standard JSON format.

## 功能特点

- 📝 支持 JSONC 格式（JSON with Comments）
- 🚀 可打包为独立的 Windows exe 可执行文件
- 💻 支持命令行直接使用
- � 支持绝对路径和相对路径
- 🎯 智能路径解析（相对路径基于 exe 所在目录）
- 🔄 自动生成输出文件（默认同目录同名）
- 📂 自动创建输出目录（如果不存在）- 🔤 支持自定义输出编码（utf8, utf16le, ascii, latin1）
- ↵️ 支持自定义换行风格（LF, CRLF, CR）
## 安装依赖

在项目目录下运行：

```bash
npm install
```

如需打包为 exe，还需全局安装 pkg：

```bash
npm install -g pkg
```

## 开发模式使用

### 基本用法

```bash
# 不指定输出文件，自动在源文件同目录生成同名 .json 文件
node index.js test.jsonc
# 生成: test.json（与 test.jsonc 同目录）

# 使用相对路径
node index.js ./config/app.jsonc
# 生成: ./config/app.json

# 使用绝对路径
node index.js C:\data\config.jsonc
# 生成: C:\data\config.json
```

### 指定输出文件

```bash
# 相对路径输出
node index.js input.jsonc -o output.json

# 输出到子目录（自动创建目录）
node index.js input.jsonc -o ./result/data.json

# 使用绝对路径输出
node index.js input.jsonc --output C:\output\result.json
```

### 指定编码和换行符

```bash
# 使用 UTF-16LE 编码输出
node index.js input.jsonc -e utf16le

# 使用 Unix 风格换行符 (LF)
node index.js input.jsonc -l lf

# 使用 Windows 风格换行符 (CRLF)
node index.js input.jsonc -l crlf

# 组合使用多个选项
node index.js input.jsonc -o output.json -e utf8 -l lf
```

## 路径说明

### 相对路径规则
- **相对路径基准**：相对路径以 exe 所在目录为起点（不是当前工作目录）
- **开发模式**：使用 `node index.js` 时，相对路径基于当前工作目录

### 源文件路径
### 基本使用示例

```bash
# 示例 1: 默认输出（在源文件同目录生成同名 json）
jsonc-to-json.exe config.jsonc
# 如果 config.jsonc 在 exe 同一目录，生成 config.json

# 示例 2: 使用相对路径（相对于 exe 所在目录）
jsonc-to-json.exe ./data/app.jsonc
# 生成: ./data/app.json

# 示例 3: 使用绝对路径
jsonc-to-json.exe C:\Projects\config.jsonc
# 生成: C:\Projects\config.json

# 示例 4: 指定输出文件（相对路径）
jsonc-to-json.exe config.jsonc -o result.json

# 示例 5: 输出到子目录（自动创建目录）
jsonc-to-json.exe config.jsonc -o ./output/result.json

# 示例 6: 指定编码为 UTF-16LE
jsonc-to-json.exe config.jsonc -e utf16le

# 示例 7: 指定 Unix 风格换行符
jsonc-to-json.exe config.jsonc -l lf

# 示例 8: 指定 Windows 风格换行符
jsonc-to-json.exe config.jsonc -l crlf

# 示例 9: 组合使用多个选项
jsonc-to-json.exe config.jsonc -o output.json -e utf8 -l lf

# 示例 10: 混合使用绝对路径和相对路径
jsonc-to-json.exe C:\data\input.jsonc -o ./output/result.json -e utf8 -l crlf
```

### 典型使用场景

#### 场景 1：exe 与 jsonc 文件在同一目录
```
C:\tools\
  ├── jsonc-to-json.exe
  └── config.jsonc

命令: jsonc-to-json.exe config.jsonc
结果: 生成 C:\tools\config.json
```

#### 场景 2：处理子目录中的文件
```
C:\tools\
  ├── jsonc-to-json.exe
  └── configs\
      └── app.jsonc

命令: jsonc-to-json.exe configs\app.jsonc
结果: 生成 C:\tools\configs\app.json
```

#### 场景 3：从其他目录处理文件
```
C:\tools\jsonc-to-json.exe
D:\projects\config.jsonc

命令: C:\tools\jsonc-to-json.exe D:\projects\config.jsonc
结果: 生成 D:\projects\config.json
```

#### 场景 4：输出到指定位置
# 方式 1: 默认输出（生成 config.json 在同一目录）
jsonc-to-json.exe config.jsonc

# 方式 2: 指定输出文件
jsonc-to-json.exe config.jsonc -o output.json
```

### 输出文件 (config.json / output.json)

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "settings": {
    "debug": true,
    "port": 3000
  }
}
```并给出明确提示：

- ❌ 未指定源文件路径
- ❌ 源文件不存在
- ❌ 指定的路径是目录而不是文件
- ❌ JSONC 格式错误（语法错误）
- ❌ 文件读写权限问题
- ❌ 无法创建输出目录

### 错误示例

```bash
# 错误 1: 文件不存在
> jsonc-to-json.exe notexist.jsonc
错误: 源文件不存在 - C:\tools\notexist.jsonc

# 错误 2: JSONC 格式错误
> jsonc-to-json.exe invalid.jsonc
错误: JSONC 解析失败
  偏移量 45: Unexpected token

# 错误 3: 未指定源文件
> jsonc-to-json.exe
错误: 必须指定源文件路径

# 错误 4: 不支持的换行符类型
> jsonc-to-json.exe config.jsonc -l invalid
错误: 不支持的换行符类型 "invalid"
支持的类型: lf, crlf, cr
```

## 命令格式

```bash
jsonc-to-json <源文件路径> [-o|--output <输出文件路径>] [-e|--encoding <编码>] [-l|--line-ending <换行符>]
```

### 参数详解

- `<源文件路径>`（必需）
  - 要转换的 JSONC 文件路径
  - 支持绝对路径或相对路径
  - 相对路径基于 exe 所在目录
  
- `-o, --output <输出文件路径>`（可选）
  - 指定输出 JSON 文件的路径
  - 如果不指定，自动在源文件同目录生成同名 `.json` 文件
  - 支持绝对路径或相对路径
  - 如果目录不存在，会自动创建

- `-e, --encoding <编码>`（可选）
  - 指定输出文件的编码格式
  - 默认值：`utf8`
  - 支持的编码：
    - `utf8` / `utf-8` - UTF-8 编码（最常用）
    - `utf16le` / `utf-16le` - UTF-16 Little Endian 编码（Windows Unicode）
    - `ascii` - ASCII 编码（仅支持 0-127 字符）
    - `latin1` - Latin-1 编码（ISO-8859-1）

- `-l, --line-ending <换行符>`（可选）
  - 指定输出文件的换行符类型
  - 默认：使用系统默认换行符
  - 支持的值：
    - `lf` - Unix/Linux/macOS 风格 (\n)
    - `crlf` - Windows 风格 (\r\n)
    - `cr` - 旧 Mac 风格 (\r)

- `-h, --help`
  - 显示帮助信息

## 打包为可执行文件

### 方法二：直接使用 pkg 命令

```bash
pkg . --target node18-win-x64 --output dist/jsonc-to-json.exe
```

打包完成后，可执行文件位于 `dist/jsonc-to-json.exe`

## 使用打包后的 exe

```bash
# 基本使用
dist\jsonc-to-json.exe input.jsonc

# 指定输出文件
dist\jsonc-to-json.exe input.jsonc -o output.json

# 指定编码
dist\jsonc-to-json.exe input.jsonc -e utf16le

# 指定换行符
dist\jsonc-to-json.exe input.jsonc -l lf

# 组合使用多个选项
dist\jsonc-to-json.exe input.jsonc -o output.json -e utf8 -l crlf
```

## 示例

### 输入文件 (config.jsonc)

```jsonc
{
  // 这是一个带注释的配置文件
  "name": "my-app",
  "version": "1.0.0",
  /* 
   * 多行注释
   * 配置项
   */
  "settings": {
    "debug": true,  // 开启调试模式
    "port": 3000
  }
}
```

### 转换命令

```bash
node index.js config.jsonc -o config.json
```

### 输出文件 (config.json)

```json
{
  "name": "my-app",
  "version": "1.0.0",
  "settings": {
    "debug": true,
    "port": 3000
  }
}
```

## 错误处理

工具会自动处理以下错误情况：

- 文件不存在
- JSONC 格式错误
- 文件读写权限问题
- 不支持的编码类型
- 不支持的换行符类型

## 技术栈

- Node.js
- jsonc-parser - 用于解析 JSONC 格式
- pkg - 用于打包为可执行文件

## 许可证

MIT
le or file

## Quick Start

```bash
# Install dependencies
npm install

# Development usage
node index.js input.jsonc -o output.json

# Build exe
npm run build
```

For detailed documentation in Chinese, see [说明文档.md](说明文档.md)

## License

MIT
