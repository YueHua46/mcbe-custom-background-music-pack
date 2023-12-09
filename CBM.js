import fs from 'fs/promises';
import path from 'path';
import { log, error } from 'console';

const CONFIG_PATH = './sounds/sound_definitions.json';
const SOUNDS_PATH = './sounds/music/game/';
const TEMP_PATH = './sounds/music/temp/';

async function renameAndReconfigureSounds() {
  try {
    // 确保临时目录存在
    await fs.mkdir(TEMP_PATH, { recursive: true });

    // step1: 重命名所有ogg资源文件
    const soundsPath = path.resolve(SOUNDS_PATH);
    log('soundsPath', soundsPath);

    const files = await fs.readdir(soundsPath);
    log('files', files);
    if (!files.length) throw new Error(`没有找到ogg文件，请检查${SOUNDS_PATH}下是否存在该音频文件`);

    // 过滤出ogg文件
    const oggFiles = files.filter(f => f.endsWith('.ogg'));
    const fileLength = oggFiles.length;

    for (let i = 0; i < oggFiles.length; i++) {
      const f = oggFiles[i];
      // 按照索引重命名每一个文件到临时目录
      const tempFilePath = path.resolve(TEMP_PATH, `${i}.ogg`);
      await fs.rename(path.resolve(soundsPath, f), tempFilePath);
    }
    log('重命名成功');

    // 将文件从临时目录移回原目录
    const tempFiles = await fs.readdir(TEMP_PATH);
    log('tempFiles', tempFiles);
    for (const tempFile of tempFiles) {
      const gameFilePath = path.resolve(soundsPath, tempFile);
      await fs.rename(path.resolve(TEMP_PATH, tempFile), gameFilePath);
    }
    log('文件已移回原目录');
    fs.rmdir(TEMP_PATH)

    // step2: 解析sound_definitions.json并改变其game.music音频列表
    const buffer = await fs.readFile(path.resolve(CONFIG_PATH))
    const jsonString = buffer.toString('utf-8')
    const jsonObj = JSON.parse(jsonString)

    log('jsonObj', jsonObj);
    const sounds = [];
    for (let i = 0; i < fileLength; i++) {
      sounds.push({
        load_on_low_memory: true,
        name: `sounds/music/game/${i}.ogg`,
        stream: true,
        volume: 0.30
      });
    }
    jsonObj.sound_definitions['music.game'].sounds = sounds;

    // step3: 将改变后的config文件写入
    await fs.writeFile(path.resolve(CONFIG_PATH), JSON.stringify(jsonObj), { encoding: "utf-8", mode: "0666" });
    log('配置文件写入成功');
    console.log('按任意键继续...')
  } catch (err) {
    error('操作失败:', err)
  } finally {
    await fs.rmdir(TEMP_PATH)
    process.stdin.setRawMode(true)
    process.stdin.resume()
    log('程序执行完毕，按任意键结束...')
    process.stdin.on('data', () => {
        process.exit(0);
    })
  }
}

// 调用函数
renameAndReconfigureSounds()
