// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

type YouTubePlayerOptions = {
	height?: number;
	width?: number;
	videoId?: string;
	playerVars?: {
		playsinline?: 0 | 1;
	};
	events?: {
		onReady?: () => void;
		onStateChange?: (event: { data: number }) => void;
	};
};

type YouTubePlayer = {
	destroy: () => void;
	getCurrentTime: () => number;
	playVideo: () => void;
};

declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
	interface Window {
		onYouTubeIframeAPIReady: () => void;
		YT: {
			Player: new (id: string, options: YouTubePlayerOptions) => YouTubePlayer;
		};
	}
}

export { YouTubePlayer, YouTubePlayerOptions };
