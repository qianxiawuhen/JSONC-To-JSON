#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const jsonc = require('jsonc-parser');

// 获取exe所在目录（打包后）或脚本所在目录（开发时）
function getExeDirectory() {
    // 在打包后的exe中，__dirname 会指向临时目录
    // process.execPath 是exe的完整路径
    // process.cwd() 是命令执行时的工作目录
    
    // 如果是打包后的exe，使用exe所在目录
    if (process.pkg) {
        return path.dirname(process.execPath);
    }
    // 开发模式下，使用当前工作目录
    return process.cwd();
}

// 显示帮助信息
function showHelp() {
    console.log(`
JSONC to JSON Converter

使用方法:
  jsonc-to-json <input.jsonc> [options]

选项:
  -o, --output <file>      指定输出文件路径（如不指定，则在源文件同目录下生成同名JSON文件）
  -e, --encoding <type>    指定输出文件编码 (默认: utf8)
                           支持: utf8, utf16le, ascii, latin1
  -l, --line-ending <type> 指定输出文件换行符 (默认: 系统默认)
                           支持: lf (\\n), crlf (\\r\\n), cr (\\r)
  -h, --help               显示帮助信息

路径说明:
  - 支持绝对路径和相对路径
  - 相对路径以exe所在目录为起点
  - 如果不指定输出文件，将在源文件同目录下生成同名的.json文件

示例:
  jsonc-to-json input.jsonc                                    # 在源文件同目录生成 input.json
  jsonc-to-json ./config/app.jsonc                             # 相对路径，生成 ./config/app.json
  jsonc-to-json C:\\data\\config.jsonc                         # 绝对路径
  jsonc-to-json input.jsonc -o output.json                     # 指定输出文件
  jsonc-to-json input.jsonc --output ./out/data.json           # 指定输出到子目录
  jsonc-to-json input.jsonc -e utf16le                         # 使用 UTF-16LE 编码输出
  jsonc-to-json input.jsonc -l crlf                            # 使用 Windows 风格换行符
  jsonc-to-json input.jsonc -o out.json -e utf8 -l lf          # 组合使用多个选项
`);
}

// 解析命令行参数
function parseArgs(args) {
    if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
        showHelp();
        process.exit(0);
    }

    const inputFile = args[0];
    let outputFile = null;
    let encoding = 'utf8';
    let lineEnding = null; // null 表示使用系统默认

    // 查找 -o 或 --output 参数
    const outputIndex = args.findIndex(arg => arg === '-o' || arg === '--output');
    if (outputIndex !== -1 && args[outputIndex + 1]) {
        outputFile = args[outputIndex + 1];
    }

    // 查找 -e 或 --encoding 参数
    const encodingIndex = args.findIndex(arg => arg === '-e' || arg === '--encoding');
    if (encodingIndex !== -1 && args[encodingIndex + 1]) {
        const encValue = args[encodingIndex + 1].toLowerCase();
        if (['utf8', 'utf-8', 'utf16le', 'utf-16le', 'ascii', 'latin1'].includes(encValue)) {
            // 统一格式
            encoding = encValue.replace('utf-8', 'utf8').replace('utf-16le', 'utf16le');
        } else {
            console.error(`错误: 不支持的编码类型 "${args[encodingIndex + 1]}"`);
            console.error('支持的类型: utf8, utf16le, ascii, latin1');
            process.exit(1);
        }
    }

    // 查找 -l 或 --line-ending 参数
    const lineEndingIndex = args.findIndex(arg => arg === '-l' || arg === '--line-ending');
    if (lineEndingIndex !== -1 && args[lineEndingIndex + 1]) {
        const leValue = args[lineEndingIndex + 1].toLowerCase();
        if (['lf', 'crlf', 'cr'].includes(leValue)) {
            lineEnding = leValue;
        } else {
            console.error(`错误: 不支持的换行符类型 "${args[lineEndingIndex + 1]}"`);
            console.error('支持的类型: lf, crlf, cr');
            process.exit(1);
        }
    }

    return { inputFile, outputFile, encoding, lineEnding };
}

// 解析并验证输入文件路径
function resolveInputPath(inputPath) {
    if (!inputPath) {
        console.error('错误: 必须指定源文件路径');
        process.exit(1);
    }

    const exeDir = getExeDirectory();
    
    // 如果是相对路径，转换为相对于exe目录的绝对路径
    const absolutePath = path.isAbsolute(inputPath) 
        ? inputPath 
        : path.resolve(exeDir, inputPath);

    // 验证文件是否存在
    if (!fs.existsSync(absolutePath)) {
        console.error(`错误: 源文件不存在 - ${absolutePath}`);
        process.exit(1);
    }

    // 验证是否是文件（不是目录）
    const stats = fs.statSync(absolutePath);
    if (!stats.isFile()) {
        console.error(`错误: 指定的路径不是文件 - ${absolutePath}`);
        process.exit(1);
    }

    return absolutePath;
}

// 解析输出文件路径
function resolveOutputPath(outputPath, inputPath) {
    const exeDir = getExeDirectory();
    
    // 如果没有指定输出路径，生成在源文件同目录下，文件名相同但扩展名为.json
    if (!outputPath) {
        const inputDir = path.dirname(inputPath);
        const inputBasename = path.basename(inputPath, path.extname(inputPath));
        return path.join(inputDir, `${inputBasename}.json`);
    }

    // 如果指定了输出路径，处理相对路径
    const absolutePath = path.isAbsolute(outputPath) 
        ? outputPath 
        : path.resolve(exeDir, outputPath);

    // 确保输出目录存在
    const outputDir = path.dirname(absolutePath);
    if (!fs.existsSync(outputDir)) {
        try {
            fs.mkdirSync(outputDir, { recursive: true });
        } catch (error) {
            console.error(`错误: 无法创建输出目录 - ${outputDir}`);
            console.error(`详细信息: ${error.message}`);
            process.exit(1);
        }
    }

    return absolutePath;
}

// 转换换行符
function convertLineEnding(content, lineEnding) {
    if (!lineEnding) {
        return content; // 使用系统默认
    }

    // 先统一转换为 \n
    let normalized = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    // 再转换为目标格式
    switch (lineEnding) {
        case 'crlf':
            return normalized.replace(/\n/g, '\r\n');
        case 'cr':
            return normalized.replace(/\n/g, '\r');
        case 'lf':
        default:
            return normalized;
    }
}

// 主函数
function main() {
    const args = process.argv.slice(2);
    const { inputFile, outputFile, encoding, lineEnding } = parseArgs(args);

    try {
        // 解析并验证输入文件路径
        const resolvedInputPath = resolveInputPath(inputFile);
        
        // 解析输出文件路径（如果没指定，会自动生成）
        const resolvedOutputPath = resolveOutputPath(outputFile, resolvedInputPath);

        // 读取 JSONC 文件
        const jsoncContent = fs.readFileSync(resolvedInputPath, 'utf8');
        
        // 解析 JSONC 并转换为 JSON
        const errors = [];
        const parsed = jsonc.parse(jsoncContent, errors);
        
        if (errors.length > 0) {
            console.error('错误: JSONC 解析失败');
            errors.forEach(err => {
                console.error(`  偏移量 ${err.offset}: ${err.error}`);
            });
            process.exit(1);
        }

        // 格式化为 JSON 字符串
        let jsonContent = JSON.stringify(parsed, null, 2);
        
        // 转换换行符
        jsonContent = convertLineEnding(jsonContent, lineEnding);
        
        // 写入输出文件
        fs.writeFileSync(resolvedOutputPath, jsonContent, encoding);
        console.log(`✓ 转换成功`);
        console.log(`  源文件: ${resolvedInputPath}`);
        console.log(`  目标文件: ${resolvedOutputPath}`);
        console.log(`  编码: ${encoding}`);
        if (lineEnding) {
            console.log(`  换行符: ${lineEnding}`);
        }
        
    } catch (error) {
        console.error(`错误: ${error.message}`);
        process.exit(1);
    }
}

// 运行主函数
main();
