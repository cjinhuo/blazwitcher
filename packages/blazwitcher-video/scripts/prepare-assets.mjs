import { copyFile, mkdir } from 'node:fs/promises'

await mkdir('public/generated', { recursive: true })
for (const scene of ['TabSwarm', 'TabGrouping']) {
	await copyFile(`media/videos/scenes/760p30/${scene}.webm`, `public/generated/${scene}.webm`)
}
await copyFile('../blazwitcher-doc/public/icon.svg', 'public/generated/icon.svg')
for (const screenshot of ['search-results', 'appearance-settings', 'search-settings', 'command-menu']) {
	await copyFile(`../../docs/video-references/${screenshot}.png`, `public/generated/${screenshot}.png`)
}
await copyFile('../blazwitcher-extension/assets/SourceCodePro.ttf', 'public/generated/SourceCodePro.ttf')
