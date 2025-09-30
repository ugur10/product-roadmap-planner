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
		<div class="header-blur"></div>
		<div class="container">
			<nav class="nav">
				<div class="nav-brand">
					<div class="logo">
						<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
							<rect width="32" height="32" rx="8" fill="url(#gradient)" />
							<path d="M8 12h16M8 16h12M8 20h16" stroke="white" stroke-width="2" stroke-linecap="round" />
							<defs>
								<linearGradient id="gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
									<stop stop-color="#6366f1" />
									<stop offset="1" stop-color="#8b5cf6" />
								</linearGradient>
							</defs>
						</svg>
					</div>
					<div class="brand-text">
						<h1>Product Roadmap</h1>
						<span class="brand-tagline">Plan · Prioritize · Deliver</span>
					</div>
				</div>
				<div class="nav-links">
					<a href="/" class="nav-link">
						<span class="nav-icon">📊</span>
						<span>Dashboard</span>
					</a>
					<a href="/matrix" class="nav-link">
						<span class="nav-icon">🎯</span>
						<span>Matrix</span>
					</a>
					<a href="/timeline" class="nav-link">
						<span class="nav-icon">📅</span>
						<span>Timeline</span>
					</a>
					<a href="/progress" class="nav-link">
						<span class="nav-icon">📈</span>
						<span>Progress</span>
					</a>
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
		position: sticky;
		top: 0;
		z-index: 50;
		background: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
		border-bottom: 1px solid var(--color-border-subtle);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
	}

	.header-blur {
		position: absolute;
		inset: 0;
		background: linear-gradient(to bottom, rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.7));
		z-index: -1;
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--space-4) 0;
		position: relative;
	}

	.nav-brand {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.logo {
		animation: float 3s ease-in-out infinite;
	}

	@keyframes float {
		0%, 100% { transform: translateY(0px); }
		50% { transform: translateY(-4px); }
	}

	.brand-text h1 {
		font-size: var(--font-size-xl);
		font-weight: 700;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin: 0;
		letter-spacing: -0.02em;
	}

	.brand-tagline {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-weight: 500;
		letter-spacing: 0.05em;
		display: block;
		margin-top: -2px;
	}

	.nav-links {
		display: flex;
		gap: var(--space-2);
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		color: var(--color-text-muted);
		text-decoration: none;
		padding: var(--space-2-5) var(--space-4);
		border-radius: var(--radius-lg);
		font-weight: 500;
		font-size: var(--font-size-sm);
		transition: all var(--duration-200) cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
	}

	.nav-link::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--gradient-primary);
		opacity: 0;
		transition: opacity var(--duration-200);
		z-index: -1;
	}

	.nav-link:hover {
		color: var(--color-text);
		background: var(--gray-100);
		transform: translateY(-1px);
	}

	.nav-link:hover::before {
		opacity: 0.08;
	}

	.nav-icon {
		font-size: 1.125rem;
		line-height: 1;
	}

	.main {
		flex: 1;
		padding: var(--space-8) 0;
		animation: fadeIn var(--duration-300) ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		.nav {
			flex-direction: column;
			gap: var(--space-4);
		}

		.nav-links {
			display: grid;
			grid-template-columns: repeat(2, 1fr);
			gap: var(--space-2);
			width: 100%;
		}

		.nav-link {
			justify-content: center;
		}

		.brand-tagline {
			display: none;
		}

		.main {
			padding: var(--space-6) 0;
		}
	}
</style>
