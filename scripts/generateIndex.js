import fs from 'fs';
import path from 'path';

const reportsDir = path.join('data', 'reports');
const outputDir = path.join('src', 'data');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function generateIndex(dir, basePath = '') {
  const items = [];
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      const subItems = generateIndex(fullPath, path.join(basePath, file));
      if (subItems.length > 0) {
        items.push({
          name: file,
          type: 'folder',
          children: subItems
        });
      }
    } else if (file.endsWith('.md')) {
      // 提取 Markdown 头部元数据
      const content = fs.readFileSync(fullPath, 'utf-8');
      const titleMatch = content.match(/^#\s+(.*)$/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
      
      items.push({
        name: file.replace('.md', ''),
        type: 'file',
        path: path.join(basePath, file).replace(/\\/g, '/'),
        title: title
      });
    }
  });

  return items;
}

const indexData = generateIndex(reportsDir);
const indexPath = path.join(outputDir, 'articleIndex.json');

fs.writeFileSync(indexPath, JSON.stringify(indexData, null, 2), 'utf-8');
console.log(`文章索引已生成: ${indexPath}`);
