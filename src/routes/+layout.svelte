<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import '../lib/styles/global.scss';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div class="app">
	<header class="header">
		<div class="container">
			<nav class="nav">
				<div class="nav-brand">
					<h1>Product Roadmap Planner</h1>
				</div>
				<div class="nav-links">
					<a href="/" class="nav-link" data-sveltekit-preload-data>Dashboard</a>
					<a href="/matrix" class="nav-link" data-sveltekit-preload-data>Priority Matrix</a>
					<a href="/timeline" class="nav-link" data-sveltekit-preload-data>Timeline</a>
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

<style lang="scss">
	.app {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.header {
		background: white;
		border-bottom: 1px solid var(--secondary-200);
		box-shadow: var(--shadow-sm);
		position: sticky;
		top: 0;
		z-index: var(--z-sticky);
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) 0;

		@media (max-width: 767px) {
			flex-direction: column;
			gap: var(--space-4);
			text-align: center;
		}
	}

	.nav-brand {
		h1 {
			font-size: var(--font-size-xl);
			font-weight: var(--font-weight-bold);
			color: var(--primary-600);
			margin: 0;
		}
	}

	.nav-links {
		display: flex;
		align-items: center;
		gap: var(--space-6);

		@media (max-width: 767px) {
			gap: var(--space-4);
		}
	}

	.nav-link {
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		color: var(--secondary-600);
		text-decoration: none;
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-md);
		transition: all var(--transition-fast);

		&:hover {
			color: var(--primary-600);
			background: var(--primary-50);
			text-decoration: none;
		}

		&.active {
			color: var(--primary-700);
			background: var(--primary-100);
		}
	}

	.main {
		flex: 1;
		padding: var(--space-8) 0;

		@media (max-width: 767px) {
			padding: var(--space-6) 0;
		}
	}
</style>
