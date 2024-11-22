import path from 'node:path';

import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const APP_DIR = path.resolve(__dirname, '../..');

const SUPPORTED_LANGUAGES = [
	{ code: 'en', label: 'Global English' },
	{ code: 'en_au', label: 'Australian English' },
	{ code: 'en_uk', label: 'British English' },
	{ code: 'en_us', label: 'US English' },
	{ code: 'es', label: 'Spanish' },
	{ code: 'fr', label: 'French' },
	{ code: 'de', label: 'German' },
	{ code: 'it', label: 'Italian' },
	{ code: 'pt', label: 'Portuguese' },
	{ code: 'nl', label: 'Dutch' },
	{ code: 'hi', label: 'Hindi' },
	{ code: 'ja', label: 'Japanese' },
	{ code: 'zh', label: 'Chinese' },
	{ code: 'fi', label: 'Finnish' },
	{ code: 'ko', label: 'Korean' },
	{ code: 'pl', label: 'Polish' },
	{ code: 'ru', label: 'Russian' },
	{ code: 'tr', label: 'Turkish' },
	{ code: 'uk', label: 'Ukrainian' },
	{ code: 'vi', label: 'Vietnamese' }
];

export { APP_DIR, SUPPORTED_LANGUAGES };
