# Spine-Viewer

A simple viewer for spine.

Use [Electron](https://www.electronjs.org)
and [Pixi.js](https://github.com/pixijs/pixijs) + [Pixi-Spine](https://github.com/pixijs/spine)

Support multi spine files.

Support exporting animation as GIF/APNG/MP4 with embedded ffmpeg.

## Instructions

- To import multi files, you can select and drag multi files into it.
- Level relation is up to reading order when importing files. Earlier read with lower level.
- Reading order is decided by order in which files are sorted in Explorer.
- The file clicked by your mouse when dragging will be start of reading.
- Only json and skel files can be read, the others will be skipped.
- If multi files, only common skins and animations will be listed.
- select order

![](https://ae01.alicdn.com/kf/S48f18d6a75b94f1094c76c9e857b7cd1T.png)

- drag order

![](https://ae01.alicdn.com/kf/Sd48a55b8b02344599276cdc1d1f1cc2ak.png)

## Preview

![1](https://ae01.alicdn.com/kf/Sd57b4d9e05234a41aedb2ef7d8294a62F.png)
![2](https://ae01.alicdn.com/kf/S69207e50860b47ffa922d835c2f67f43I.png)
![3](https://ae01.alicdn.com/kf/Sdb52e10cb8c84ba6bc221680961abecea.png)

## Download

[Release](https://github.com/anosu/Spine-Viewer/releases)

## Build

```
npm i
npm run electron:build
```