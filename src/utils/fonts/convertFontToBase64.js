import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 字体文件路径
const fontPath = path.join(__dirname, 'SourceHanSansSC-Regular.otf');
const outputPath = path.join(__dirname, 'SourceHanSansSC-Regular.js');

// 读取字体文件并转换为Base64
const fontBuffer = fs.readFileSync(fontPath);
const base64Font = fontBuffer.toString('base64');

// 创建JavaScript模块
const jsContent = `// 思源黑体 Regular - Base64 格式
export const SourceHanSansSC_Regular = '${base64Font}';
`;

// 写入JavaScript文件
fs.writeFileSync(outputPath, jsContent);

console.log(`字体转换完成: ${outputPath}`); 