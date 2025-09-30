<script lang="ts">
	import { featuresStore } from '$lib/stores/features.svelte.js';
	import FeaturesList from '$lib/components/FeaturesList.svelte';
	import FeatureForm from '$lib/components/FeatureForm.svelte';

	let showForm = $state(false);
	let showAllFeatures = $state(false);

	function handleAddFeature() {
		showForm = true;
	}

	function handleCloseForm() {
		showForm = false;
	}

	function handleViewAll() {
		showAllFeatures = true;
	}

	function handleBackToDashboard() {
		showAllFeatures = false;
	}

	const recentFeatures = $derived(() => {
		return [...featuresStore.features]
			.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
			.slice(0, 3);
	});
</script>

{#if showAllFeatures}
	<div class="page">
		<header class="page-header">
			<div class="header-content">
				<button class="btn btn-secondary btn-sm" onclick={handleBackToDashboard}>
					← Back to Dashboard
				</button>
				<div>
					<h1>All Features</h1>
					<p class="text-muted">Manage your complete product roadmap</p>
				</div>
			</div>
		</header>

		<FeaturesList />
	</div>
{:else}
	<div class="page">
		<header class="page-header">
			<div class="header-content-main">
				<div>
					<h1 class="page-title">Dashboard</h1>
					<p class="page-subtitle">Manage your product roadmap and feature priorities</p>
				</div>
				<button class="btn btn-primary" onclick={handleAddFeature}>
					<span>✨</span>
					Add Feature
				</button>
			</div>
		</header>

		<div class="dashboard-grid">
			<div class="card stats-card">
				<h3>Feature Overview</h3>
				<div class="stats-grid">
					<div class="stat">
						<div class="stat-value">{featuresStore.stats().total}</div>
						<div class="stat-label">Total Features</div>
					</div>
					<div class="stat">
						<div class="stat-value">{featuresStore.stats().inProgress}</div>
						<div class="stat-label">In Progress</div>
					</div>
					<div class="stat">
						<div class="stat-value">{featuresStore.stats().completed}</div>
						<div class="stat-label">Completed</div>
					</div>
				</div>
			</div>

			<div class="card">
				<h3>Quick Actions</h3>
				<div class="actions">
					<button class="btn btn-secondary" onclick={handleViewAll}>
						<span>📋</span>
						View All Features
					</button>
					<button class="btn btn-secondary" disabled>
						<span>💾</span>
						Export Data
					</button>
				</div>
			</div>

			<div class="card features-card">
				<div class="card-header">
					<h3>Recent Features</h3>
					<button class="btn btn-secondary btn-sm" onclick={handleViewAll}>View All</button>
				</div>
				{#if recentFeatures().length > 0}
					<div class="recent-features">
						{#each recentFeatures() as feature}
							<div class="feature-item">
								<div class="feature-info">
									<h4>{feature.title}</h4>
									<p>{feature.description}</p>
									<div class="feature-meta">
										<span class="badge priority-{feature.priority}">{feature.priority}</span>
										<span class="badge status-{feature.status}"
											>{feature.status.replace('_', ' ')}</span
										>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{:else}
					<div class="empty-state">
						<div class="empty-icon">📋</div>
						<p class="empty-text">No features yet</p>
						<p class="text-muted">Add your first feature to get started</p>
						<button class="btn btn-primary" onclick={handleAddFeature}>Add Feature</button>
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

{#if showForm}
	<FeatureForm feature={null} onClose={handleCloseForm} />
{/if}

<style>
	.page-header {
		margin-bottom: var(--space-8);
	}

	.header-content-main {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
	}

	.page-title {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: var(--space-2);
		letter-spacing: -0.02em;
	}

	.page-subtitle {
		color: var(--color-text-muted);
		font-size: var(--font-size-base);
		margin: 0;
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-6);
	}

	.card {
		padding: var(--space-6);
	}

	.stats-card .stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
		margin-top: var(--space-4);
	}

	.stat {
		text-align: center;
		padding: var(--space-4);
		background: linear-gradient(135deg, var(--gray-50) 0%, white 100%);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
		transition: all var(--duration-200);
		position: relative;
		overflow: hidden;
	}

	.stat::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: var(--gradient-primary);
		opacity: 0;
		transition: opacity var(--duration-200);
	}

	.stat:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.stat:hover::before {
		opacity: 1;
	}

	.stat-value {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		background: var(--gradient-primary);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
		margin-bottom: var(--space-2);
		line-height: 1;
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.card-header h3 {
		margin: 0;
	}

	.features-card {
		grid-column: 1 / -1;
	}

	.header-content {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.recent-features {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.feature-item {
		padding: var(--space-4);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-lg);
		background: linear-gradient(135deg, white 0%, var(--gray-50) 100%);
		transition: all var(--duration-200);
		cursor: pointer;
	}

	.feature-item:hover {
		transform: translateX(4px);
		box-shadow: var(--shadow-md);
		border-color: var(--color-border);
	}

	.feature-info h4 {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--font-size-base);
		font-weight: 600;
	}

	.feature-info p {
		margin: 0 0 var(--space-3) 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		line-height: 1.4;
	}

	.feature-meta {
		display: flex;
		gap: var(--space-2);
		flex-wrap: wrap;
	}

	.badge {
		display: inline-flex;
		align-items: center;
		gap: var(--space-1);
		padding: var(--space-1-5) var(--space-3);
		border-radius: var(--radius-full);
		font-size: var(--font-size-xs);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		box-shadow: var(--shadow-xs);
		border: 1px solid rgba(0, 0, 0, 0.05);
	}

	.badge.priority-critical {
		background: rgba(239, 68, 68, 0.1);
		color: rgb(239, 68, 68);
	}

	.badge.priority-high {
		background: rgba(245, 158, 11, 0.1);
		color: rgb(245, 158, 11);
	}

	.badge.priority-medium {
		background: rgba(59, 130, 246, 0.1);
		color: rgb(59, 130, 246);
	}

	.badge.priority-low {
		background: rgba(34, 197, 94, 0.1);
		color: rgb(34, 197, 94);
	}

	.badge.status-completed {
		background: rgba(34, 197, 94, 0.1);
		color: rgb(34, 197, 94);
	}

	.badge.status-in_progress {
		background: rgba(59, 130, 246, 0.1);
		color: rgb(59, 130, 246);
	}

	.badge.status-testing {
		background: rgba(245, 158, 11, 0.1);
		color: rgb(245, 158, 11);
	}

	.badge.status-planning {
		background: rgba(107, 114, 128, 0.1);
		color: rgb(107, 114, 128);
	}

	.badge.status-on_hold {
		background: rgba(239, 68, 68, 0.1);
		color: rgb(239, 68, 68);
	}

	.empty-state {
		text-align: center;
		padding: var(--space-12) var(--space-4);
		background: linear-gradient(135deg, var(--indigo-50) 0%, var(--violet-50) 100%);
		border-radius: var(--radius-2xl);
		animation: fadeIn var(--duration-500) ease-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: scale(0.95);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.empty-icon {
		font-size: 4rem;
		margin-bottom: var(--space-4);
		animation: float 3s ease-in-out infinite;
		display: inline-block;
	}

	@keyframes float {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-8px);
		}
	}

	.empty-text {
		font-size: var(--font-size-xl);
		font-weight: 600;
		margin-bottom: var(--space-2);
		color: var(--gray-900);
	}

	.empty-state .text-muted {
		margin-bottom: var(--space-6);
		font-size: var(--font-size-base);
	}

	@media (min-width: 768px) {
		.dashboard-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.features-card {
			grid-column: span 2;
		}
	}
</style>
