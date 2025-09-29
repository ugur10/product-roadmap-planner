<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../lib/styles/global.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="app">
	<header class="header">
		<div class="container">
			<nav class="nav">
				<div class="nav-brand">
					<h1>Product Roadmap</h1>
				</div>
				<div class="nav-links">
					<a href="/" class="nav-link">Dashboard</a>
					<a href="/matrix" class="nav-link">Matrix</a>
					<a href="/timeline" class="nav-link">Timeline</a>
					<a href="/progress" class="nav-link">Progress</a>
				</div>
			</nav>
		</div>
	</header>

	<main class="main">
		<div class="container">
			{@render children?.()}
		</div>
	</main>
</div>

<style>
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.header {
		background: var(--color-bg);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 50;
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) 0;
	}

	.nav-brand h1 {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-primary);
		margin: 0;
	}

	.nav-links {
		display: flex;
		gap: var(--space-6);
	}

	.nav-link {
		color: var(--color-text-muted);
		text-decoration: none;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius);
		font-weight: 500;
		font-size: var(--font-size-sm);
		transition: all 0.15s ease;
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--gray-100);
	}

	.main {
		flex: 1;
		padding: var(--space-8) 0;
	}

	@media (max-width: 768px) {
		.nav {
			flex-direction: column;
			gap: var(--space-4);
		}

		.nav-links {
			gap: var(--space-4);
		}

		.main {
			padding: var(--space-6) 0;
		}
	}
</style>