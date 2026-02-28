const fs = require('fs')
const path = require('path')

const src = path.join(__dirname, '..', 'node_modules', '@mediapipe', 'tasks-vision', 'wasm')
const dest = path.join(__dirname, '..', 'public', 'mediapipe-wasm')

if (!fs.existsSync(src)) {
  console.warn('MediaPipe WASM not found at', src, '- run npm install first')
  process.exit(0)
}

fs.mkdirSync(dest, { recursive: true })
for (const name of fs.readdirSync(src)) {
  fs.copyFileSync(path.join(src, name), path.join(dest, name))
}
console.log('Copied MediaPipe WASM to public/mediapipe-wasm')
