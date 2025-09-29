<script lang="ts">
	import PriorityMatrix from '$lib/components/PriorityMatrix.svelte';
	import FeatureForm from '$lib/components/FeatureForm.svelte';
	import type { Feature } from '$lib/types.js';

	let selectedFeature: Feature | null = $state(null);
	let showForm = $state(false);

	function handleFeatureSelect(feature: Feature) {
		selectedFeature = feature;
		showForm = true;
	}

	function handleCloseForm() {
		showForm = false;
		selectedFeature = null;
	}
</script>

<svelte:head>
	<title>Priority Matrix - Product Roadmap Planner</title>
	<meta
		name="description"
		content="Interactive Impact vs Effort matrix for strategic feature prioritization"
	/>
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>Priority Matrix</h1>
		<p class="text-muted">Strategic Impact vs Effort analysis for feature prioritization</p>
	</header>

	<div class="matrix-content">
		<div class="matrix-instructions">
			<div class="instruction-card">
				<h3>How to Use</h3>
				<ul>
					<li>
						<strong>Drag & Drop:</strong> Move features around the matrix to adjust their Impact and
						Effort scores
					</li>
					<li><strong>Click:</strong> Click on any feature dot to edit its details</li>
					<li>
						<strong>Auto-Priority:</strong> Feature priorities update automatically based on matrix position
					</li>
					<li>
						<strong>Quadrants:</strong> Features are categorized into strategic quadrants based on their
						scores
					</li>
				</ul>
			</div>
		</div>

		<PriorityMatrix onFeatureSelect={handleFeatureSelect} />

		<div class="matrix-insights">
			<div class="insight-card">
				<h3>Strategic Insights</h3>
				<div class="insights-grid">
					<div class="insight" style="--insight-color: #10b981;">
						<span
							class="insight-icon"
							style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<circle cx="12" cy="12" r="10"></circle>
								<polyline points="16,12 12,8 8,12"></polyline>
								<line x1="12" y1="16" x2="12" y2="12"></line>
							</svg>
						</span>
						<div>
							<strong>Quick Wins</strong>
							High impact, low effort initiatives that deliver immediate value with minimal resources.
						</div>
					</div>
					<div class="insight" style="--insight-color: #3b82f6;">
						<span
							class="insight-icon"
							style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<circle cx="12" cy="12" r="3"></circle>
								<path d="m8 16 4-4 4 4"></path>
								<path d="m8 8 4 4 4-4"></path>
							</svg>
						</span>
						<div>
							<strong>Major Projects</strong>
							High-impact initiatives requiring significant investment and careful strategic planning.
						</div>
					</div>
					<div class="insight" style="--insight-color: #f59e0b;">
						<span
							class="insight-icon"
							style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<rect x="9" y="9" width="6" height="6"></rect>
								<path d="m16 16 4 4"></path>
								<path d="m8 16 4 4"></path>
								<path d="m16 8 4-4"></path>
								<path d="m8 8 4-4"></path>
							</svg>
						</span>
						<div>
							<strong>Fill-ins</strong>
							Low-impact, low-effort tasks perfect for utilizing spare development capacity.
						</div>
					</div>
					<div class="insight" style="--insight-color: #ef4444;">
						<span
							class="insight-icon"
							style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);"
						>
							<svg
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
							>
								<circle cx="12" cy="12" r="10"></circle>
								<line x1="15" y1="9" x2="9" y2="15"></line>
								<line x1="9" y1="9" x2="15" y2="15"></line>
							</svg>
						</span>
						<div>
							<strong>Money Pit</strong>
							High-effort, low-impact features that should be avoided or significantly redesigned.
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

{#if showForm}
	<FeatureForm feature={selectedFeature} onClose={handleCloseForm} />
{/if}

<style>
	.page-header {
		margin-bottom: var(--space-12);
		text-align: center;
		max-width: 800px;
		margin-left: auto;
		margin-right: auto;
	}

	.page-header h1 {
		margin-bottom: var(--space-4);
		font-size: clamp(2.5rem, 5vw, 4rem);
		font-weight: 800;
		background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #475569 100%);
		background-clip: text;
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		letter-spacing: -0.03em;
		line-height: 1.1;
		text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	.page-header .text-muted {
		font-size: var(--font-size-xl);
		font-weight: 500;
		color: var(--color-text-muted);
		max-width: 700px;
		margin: 0 auto;
		line-height: 1.7;
		letter-spacing: -0.01em;
	}

	.matrix-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--space-6);
	}

	.matrix-instructions {
		display: flex;
		justify-content: center;
	}

	.instruction-card {
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		border: 1px solid var(--gray-200);
		border-radius: var(--radius-2xl);
		padding: var(--space-8) var(--space-10);
		max-width: 900px;
		width: 100%;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
		border-top: 3px solid var(--color-primary);
	}

	.instruction-card h3 {
		margin: 0 0 var(--space-6) 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text);
		text-align: center;
		letter-spacing: -0.025em;
	}

	.instruction-card ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-4);
	}

	.instruction-card li {
		position: relative;
		padding: var(--space-4);
		background: white;
		border-radius: var(--radius-lg);
		border: 1px solid var(--gray-100);
		color: var(--color-text);
		line-height: 1.6;
		transition: all 0.2s ease;
	}

	.instruction-card li:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
		border-color: var(--gray-200);
	}

	.instruction-card li::before {
		content: '';
		display: none;
	}

	.instruction-card strong {
		color: var(--color-primary);
		font-weight: 700;
		display: block;
		margin-bottom: var(--space-2);
		font-size: var(--font-size-base);
	}

	.matrix-insights {
		display: flex;
		justify-content: center;
	}

	.insight-card {
		background: white;
		border: 1px solid var(--gray-200);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		max-width: 1000px;
		width: 100%;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.insight-card h3 {
		margin: 0 0 var(--space-8) 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text);
		text-align: center;
		letter-spacing: -0.025em;
	}

	.insights-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-8);
		margin-top: var(--space-2);
	}

	.insight {
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
		padding: var(--space-6);
		border-radius: var(--radius-lg);
		background: white;
		border: 1px solid var(--gray-200);
		transition: all 0.2s ease;
		position: relative;
	}

	.insight::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--insight-color, var(--color-primary));
		border-radius: var(--radius-lg) var(--radius-lg) 0 0;
	}

	.insight:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
		border-color: var(--gray-300);
	}

	.insight-icon {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-lg);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.insight div {
		font-size: var(--font-size-base);
		line-height: 1.6;
		color: var(--color-text);
	}

	.insight strong {
		display: block;
		margin-bottom: var(--space-3);
		font-weight: 700;
		font-size: var(--font-size-lg);
		color: var(--color-text);
	}

	@media (max-width: 1024px) {
		.matrix-content {
			padding: 0 var(--space-4);
			gap: var(--space-6);
		}

		.instruction-card,
		.insight-card {
			padding: var(--space-6) var(--space-8);
		}

		.insights-grid {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: var(--space-6);
		}
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: clamp(2rem, 6vw, 3rem);
		}

		.page-header .text-muted {
			font-size: var(--font-size-lg);
		}

		.matrix-content {
			padding: 0 var(--space-3);
			gap: var(--space-5);
		}

		.instruction-card,
		.insight-card {
			padding: var(--space-5) var(--space-6);
		}

		.insights-grid {
			grid-template-columns: 1fr;
			gap: var(--space-5);
		}

		.insight {
			padding: var(--space-6);
			gap: var(--space-4);
		}

		.insight-icon {
			width: 36px;
			height: 36px;
		}
	}

	@media (max-width: 640px) {
		.page-header {
			margin-bottom: var(--space-8);
		}

		.page-header h1 {
			font-size: clamp(1.75rem, 8vw, 2.5rem);
		}

		.page-header .text-muted {
			font-size: var(--font-size-base);
			max-width: 90%;
		}

		.matrix-content {
			padding: 0 var(--space-2);
			gap: var(--space-4);
		}

		.instruction-card,
		.insight-card {
			padding: var(--space-4) var(--space-5);
		}

		.instruction-card ul {
			grid-template-columns: 1fr;
		}

		.insight {
			padding: var(--space-5);
			gap: var(--space-3);
		}

		.insight-icon {
			width: 32px;
			height: 32px;
		}

		.insight strong {
			font-size: var(--font-size-base);
		}
	}
</style>
