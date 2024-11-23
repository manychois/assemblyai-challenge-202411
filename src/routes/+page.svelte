<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import { enhance, applyAction } from '$app/forms';
	import { browser } from '$app/environment';
	import type { YouTubePlayer } from '../app';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let currentTime = $state(0); // in milliseconds
	let apiReady = $state(false);
	let processing = $state(false);
	let formUrl = $state('');
	let formLanguage = $state('');

	type PlayerEvent = {
		data: number;
	};

	if (browser) {
		let wordHighlighter: number | ReturnType<typeof setTimeout> = 0;
		let scrollChecker: number | ReturnType<typeof setTimeout> = 0;

		let player: null | YouTubePlayer = null;
		window.onYouTubeIframeAPIReady = () => {
			apiReady = true;
		};

		let lyricsObserver: null | IntersectionObserver = null;
		$effect(() => {
			if (apiReady && form && form.success && form.videoId) {
				if (player) {
					player.destroy();
				}

				$inspect(form.videoId);

				player = new window.YT.Player('player', {
					playerVars: {
						playsinline: 1
					},
					videoId: form.videoId,
					events: {
						onReady: onPlayerReady,
						onStateChange: onPlayerStateChange
					}
				});

				document.getElementById('player')!.scrollIntoView({ behavior: 'smooth', block: 'start' });

				if (!lyricsObserver) {
					lyricsObserver = new IntersectionObserver(
						(entries) => {
							entries.forEach((entry) => {
								if (!entry.isIntersecting) {
									const word = entry.target as HTMLElement;
									word.scrollIntoView({ behavior: 'smooth', block: 'center' });
								}
								lyricsObserver!.unobserve(entry.target);
							});
						},
						{
							root: document.querySelector('.lyrics'),
							threshold: 1,
							rootMargin: '0px 0px -30% 0px'
						}
					);
				}
			}
		});

		function onPlayerReady() {
			player!.playVideo();
			const iframe = document.querySelector('iframe');
			iframe!.classList.add('w-full', 'aspect-video');
			iframe!.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}

		let lastHightlighted: null | Element = null;

		function onPlayerStateChange(event: PlayerEvent) {
			const state = event.data;
			if (state === 1) {
				if (wordHighlighter === 0) {
					wordHighlighter = setInterval(() => {
						currentTime = player!.getCurrentTime() * 1000;
					}, 100);
				}
				if (scrollChecker === 0) {
					scrollChecker = setInterval(() => {
						const highlighted = document.querySelectorAll('.word.start');
						if (highlighted.length > 0) {
							const last = highlighted[highlighted.length - 1];
							if (lastHightlighted !== last) {
								lastHightlighted = last;
								lyricsObserver!.observe(last);
							}
						}
					}, 100);
				}
			} else {
				if (wordHighlighter) {
					clearInterval(wordHighlighter);
					wordHighlighter = 0;
				}
				if (scrollChecker) {
					clearInterval(scrollChecker);
					scrollChecker = 0;
				}
			}
		}
	}

	function preselect(event: Event) {
		event.preventDefault();
		const target = (event.target as Element).closest('a') as HTMLAnchorElement;
		formUrl = target.href;
		formLanguage = 'en';
	}
</script>

<form
	method="POST"
	use:enhance={() => {
		processing = true;
		return async ({ result }) => {
			await applyAction(result);
			processing = false;
			formUrl = form!.url;
			formLanguage = form!.language;
		};
	}}
>
	<div class="border-t border-white/10 pt-12">
		<h2 class="text-base/7 font-semibold text-white">How to use?</h2>
		<p class="mt-1 text-sm/6 text-gray-400">
			Fill in the YouTube link and select the language of the song.<br>
			Then click the "Start" button to see the magic happen!<br>
			Depending on the length of the song, it may take a few minutes to process.
		</p>

		<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
			<div class="col-span-6">
				<label for="url" class="block text-sm/6 font-medium text-white">YouTube link</label>
				<div class="mt-2">
					<input
						type="url"
						name="url"
						id="url"
						class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm/6"
						placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
						bind:value={formUrl}
						required
					/>
				</div>
			</div>

			<div class="sm:col-span-3">
				<label for="language" class="block text-sm/6 font-medium text-white">Language</label>
				<div class="mt-2">
					<select
						id="language"
						name="language"
						class="block w-full rounded-md border-0 bg-white/5 py-1.5 text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-inset focus:ring-indigo-500 sm:text-sm/6 [&_*]:text-black"
						bind:value={formLanguage}
						required
					>
						{#each data.supportedLanguages as item}
							<option value={item.code}>{item.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="col-span-6">
				<label for="api-key" class="block text-sm/6 font-medium text-white">
					Pre-built examples
				</label>
				<div class="mt-2">
					<div class="columns-3">
						<a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" onclick={preselect}>
							<img class="w-full" src="/1.jpg" alt="Rick Astley - Never Gonna Give You Up" />
						</a>
						<a href="https://www.youtube.com/watch?v=Eo-KmOd3i7s" onclick={preselect}>
							<img class="w-full" src="/2.jpg" alt="*NSYNC - Bye Bye Bye" />
						</a>
						<a href="https://www.youtube.com/watch?v=nHalaFUqnTI" onclick={preselect}>
							<img class="w-full" src="/3.jpg" alt="Ron Wasserman - Go Go Power Rangers" />
						</a>
					</div>
				</div>
				<p class="mt-3 text-sm/6 text-gray-400">
					Don't know which music video to pick? select one of the above to quickly see how this app
					works!
				</p>
			</div>
		</div>
	</div>

	<div class="mt-6 flex items-center justify-end gap-x-6">
		<button
			type="submit"
			class="rounded-md bg-indigo-500 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
			disabled={processing}
		>
			{#if processing}
				Processing...
			{:else}
				Start
			{/if}
		</button>
	</div>
</form>

{#if form}
	{#if form.success}
		<div class="my-12" class:processing>
			<div class="mb-6">
				<div id="player"></div>
			</div>
			<div class="lyrics">
				{#each form.lines as line}
					<div class="line">
						{#each line as { text, start, end }}
							{@const duration = Math.round((end - start) / 100) * 100}
							<span
								class="word"
								class:start={start <= currentTime}
								data-text={text}
								data-duration={duration}>{text}</span
							>
						{/each}
					</div>
				{/each}
			</div>
		</div>
		<script src="https://www.youtube.com/iframe_api"></script>
	{:else}
		<div class="my-12">
			<p class="text-red-500">{form.errorMsg}</p>
		</div>
	{/if}
{/if}

<style lang="scss">
	.processing {
		pointer-events: none;
		filter: blur(5px);
	}

	.lyrics {
		min-height: 15rem;
		max-height: 30vh;
		overflow-y: scroll;
	}

	.word {
		display: inline-block;
		position: relative;
		font-size: 1.5rem;
		color: #777;
		white-space: nowrap;
		margin-right: 0.5em;

		&.start {
			&::after {
				content: attr(data-text);
				position: absolute;
				left: 0;
				top: 0;
				color: #00f;
				overflow: hidden;
				animation: run-text 2s 1 linear;
				width: 100%;
			}

			@for $i from 1 through 20 {
				&[data-duration='#{$i * 100}']::after {
					animation: run-text #{$i * 100}ms 1 linear;
				}
			}
		}
	}

	@keyframes run-text {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}
</style>
