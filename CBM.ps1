# 定义路径
$CONFIG_PATH = './sounds/sound_definitions.json'
$SOUNDS_PATH = './sounds/music/game/'

# step1: 重命名所有ogg资源文件
$soundsPath = Resolve-Path $SOUNDS_PATH
Write-Host "soundsPath: $soundsPath"

$files = Get-ChildItem -Path $soundsPath -Filter *.ogg
Write-Host "files: $files"
if ($files.Length -eq 0) {
    throw "没有找到ogg文件，请检查${SOUNDS_PATH}下是否存在该音频文件"
}

# 过滤出ogg文件并按索引重命名每一个文件
$fileLength = $files.Length
for ($i = 0; $i -lt $fileLength; $i++) {
    $f = $files[$i]
    $newFileName = "$i.ogg"
    Rename-Item -Path $f.FullName -NewName $newFileName
}
Write-Host "重命名成功"

# step2: 解析sound_definitions.json并改变其game.music音频列表
$jsonString = Get-Content -Path $CONFIG_PATH -Raw
$jsonObj = ConvertFrom-Json $jsonString

Write-Host "jsonObj: $jsonObj"
$sounds = @()
for ($i = 0; $i -lt $fileLength; $i++) {
    $sounds += @{
        load_on_low_memory = $true
        name = "sounds/music/game/$i.ogg"
        stream = $true
        volume = 0.30
    }
}

# 检查sound_definitions对象中是否存在music.game键
if (-not $jsonObj.sound_definitions.'music.game') {
    $jsonObj.sound_definitions | Add-Member -Name 'music.game' -MemberType NoteProperty -Value @{sounds = @()}
}

$jsonObj.sound_definitions.'music.game'.sounds = $sounds

# step3: 将改变后的config文件写入
$jsonObj | ConvertTo-Json -Depth 10 | Set-Content -Path $CONFIG_PATH -Encoding UTF8
Write-Host "配置文件写入成功"

# 程序执行完毕，按任意键结束
Write-Host "程序执行完毕，按任意键结束..."
$null = [Console]::ReadKey($true)
