import { copyFile, mkdir } from 'node:fs/promises'

const target = '../blazwitcher-doc/public/video'
await mkdir(target, { recursive: true })
for (const locale of ['zh', 'en']) {
	await copyFile(`out/blazwitcher-hero-${locale}.mp4`, `${target}/blazwitcher-hero-${locale}.mp4`)
	const poster = `blazwitcher-hero-${locale === 'en' ? 'en-' : ''}poster.jpg`
	await copyFile(`out/${poster}`, `${target}/${poster}`)
	await copyFile(`captions/${locale}.vtt`, `${target}/blazwitcher-hero-${locale}.vtt`)
}
