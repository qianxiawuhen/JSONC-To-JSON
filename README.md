# JSONC to JSON 转换工具

一个简单的命令行工具，用于将 JSONC（带注释的 JSON）文件转换为标准 JSON 格式。

## 命令格式

```bash
jsonc-to-json.exe 源文件路径 -o 输出文件路径 -e utf8 -l lf
```

### 参数说明

- `源文件路径`（必需）
  - 要转换的 JSONC 文件路径
  - 支持绝对路径或相对路径
  
- `-o, --output 输出文件路径`（可选）
  - 指定输出 JSON 文件的路径
  - 如果不指定，自动在源文件同目录生成同名 `.json` 文件

- `-e, --encoding 编码`（可选）
  - 指定输出文件的编码格式（默认：`utf8`）
  - 支持的编码：`utf8`, `utf16le`, `ascii`, `latin1`

- `-l, --line-ending 换行符`（可选）
  - 指定输出文件的换行符类型
  - 支持的值：`lf` (Unix), `crlf` (Windows), `cr` (旧 Mac)

- `-h, --help`
  - 显示帮助信息

## Quick Start

```bash
# 安装依赖
npm install

# 开发环境测试功能
node index.js input.jsonc -o output.json

# 打包
npm run build
```