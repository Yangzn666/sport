# 修复HTML文件编码问题
$filePath = "THE_GOAT_黄佳炀_球王传奇.html"

Write-Host "正在修复文件编码..."

# 读取原始内容(使用默认编码)
$originalContent = Get-Content $filePath -Raw

# 尝试修复乱码的title
$fixedContent = $originalContent -replace '馃弳 鐞冪帇榛勪匠鐐€ - 鍙啝鑽ｈ€€ 馃鈥嶁檪锔?', ' 球王黄佳炀 - 双冠荣耀 🏆💪'

# 保存为UTF-8(无BOM)
$utf8NoBom = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText($filePath, $fixedContent, $utf8NoBom)

Write-Host "✅ 编码修复完成!"
Write-Host "文件: $filePath"
