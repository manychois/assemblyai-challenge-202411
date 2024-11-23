<script lang="ts">
	import '../app.css';
	let { children } = $props();
</script>

<div class="px-6 py-12 sm:px-6 lg:px-8">
	<div class="mx-auto max-w-2xl text-center">
		<h1 class="text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
			YouTube <span class="text-red-500">&times;</span> Karaoke
		</h1>
		<p class="mx-auto mt-6 max-w-xl text-pretty text-lg/8 text-gray-300">
			Sing along with your favourite YouTube video!
		</p>
		<div class="mt-10 flex items-center justify-center gap-x-6">
			<a
				href="https://dev.to/manychois/youtube-karaoke-sveltekit-app-powered-by-assemblyai-309d"
				class="text-sm/6 font-semibold text-white"
			>
				The submission for the AssemblyAI Challenge by Siu Pang Tommy Choi
			</a>
		</div>
	</div>
</div>
<div class="px-6 pb-36 sm:px-6 lg:px-8 lg:pb-72">
	<div class="mx-auto max-w-2xl">
		<main>
			{@render children()}
		</main>
	</div>
</div>
