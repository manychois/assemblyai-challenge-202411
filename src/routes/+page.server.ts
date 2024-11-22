import type { Actions } from './$types';
import { exec } from 'node:child_process';
import {
	AssemblyAI,
	type TranscribeParams,
	type Transcript,
	type TranscriptWord
} from 'assemblyai';
import fs from 'node:fs';
import { APP_DIR, SUPPORTED_LANGUAGES } from '$lib/common';
import { ASSEMBLYAI_API_KEY } from '$env/static/private';

export const actions = {
	default: async ({ request }) => {
		const data = await request.formData();
		const url = data.get('url')?.toString() ?? '';
		const videoId = url.split('v=')[1] ?? '';
		const language = data.get('language')?.toString() ?? 'en';
		const sampleJsonPath = `${APP_DIR}/samples/${videoId}.json`;
		let transcript: Transcript;
		try {
			const sampleJson = await fs.promises.readFile(sampleJsonPath, 'utf-8');
			transcript = JSON.parse(sampleJson) as Transcript;
		} catch {
			const tmpFilePath = await downloadYouTube(videoId, url);
			transcript = await transcribe(videoId, language, tmpFilePath);
		}

		const textLines = (transcript.text ?? '').split(/(?<=\W)\s+|\s+(?=[A-Z][a-z]+)/);
		let i = 0;
		while (i < textLines.length - 1) {
			const wordCount = textLines[i].split(/\s+/).length;
			if (wordCount < 4) {
				textLines[i] = (textLines[i] + ' ' + textLines[i + 1]).trim();
				textLines.splice(i + 1, 1);
			} else {
				i++;
			}
		}
		i = 0;
		let j = 0;
		const wordLines: TranscriptWord[][] = [[]];
		for (const word of transcript.words ?? []) {
			const line = textLines[i] ?? '';
			if (line === '') {
				wordLines[wordLines.length - 1].push(word);
				continue;
			}
			const pos = line.indexOf(word.text, j);
			if (pos === -1) {
				wordLines.push([word]);
				i++;
				j = 0;
			} else {
				wordLines[wordLines.length - 1].push(word);
				j = pos + word.text.length;
			}
		}

		return {
			success: true,
			url,
			language,
			videoId,
			lines: wordLines
		};
	}
} satisfies Actions;

export async function load() {
	// await clearTempFiles();
	return { supportedLanguages: SUPPORTED_LANGUAGES };
}

function downloadYouTube(videoId: string, url: string): Promise<string> {
	return new Promise((resolve, reject) => {
		const tempFilePath = `/tmp/youtube-${videoId}.m4a`;
		fs.promises
			.access(tempFilePath)
			.then(() => resolve(tempFilePath))
			.catch(() => {
				const command = `yt-dlp -o ${tempFilePath} -x --audio-format m4a --audio-quality 8 "${url}"`;
				exec(command, (error) => {
					if (error) {
						console.error(`exec error: ${error}`);
						reject(error);
					}
					resolve(tempFilePath);
				});
			});
	});
}

async function transcribe(videoId: string, language: string, file: string): Promise<Transcript> {
	const tempFilePath = `/tmp/transcript-${videoId}-${language}.json`;
	try {
		const transcriptJson = await fs.promises.readFile(tempFilePath, 'utf-8');
		const transcript = JSON.parse(transcriptJson) as Transcript;
		return transcript;
	} catch {
		const client = new AssemblyAI({
			apiKey: ASSEMBLYAI_API_KEY
		});
		const apiParams: TranscribeParams = {
			audio: file,
			language_code: language
		};
		const transcript = await client.transcripts.transcribe(apiParams);
		await fs.promises.writeFile(tempFilePath, JSON.stringify(transcript), 'utf-8');
		return transcript;
	}
}
