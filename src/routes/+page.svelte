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
			<h1>Dashboard</h1>
			<p class="text-muted">Manage your product roadmap and feature priorities</p>
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
					<button class="btn btn-primary" onclick={handleAddFeature}>Add Feature</button>
					<button class="btn btn-secondary" onclick={handleViewAll}>View All Features</button>
					<button class="btn btn-secondary" disabled>Export Data</button>
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

	.page-header h1 {
		margin-bottom: var(--space-2);
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
		padding: var(--space-3);
		background: var(--gray-50);
		border-radius: var(--radius);
	}

	.stat-value {
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-2);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
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
		padding: var(--space-3);
		border: 1px solid var(--gray-200);
		border-radius: var(--radius);
		background: var(--gray-50);
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
		display: inline-block;
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius);
		font-size: var(--font-size-xs);
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.05em;
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
		padding: var(--space-8) var(--space-4);
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
		opacity: 0.5;
	}

	.empty-text {
		font-size: var(--font-size-lg);
		font-weight: 500;
		margin-bottom: var(--space-2);
	}

	.empty-state .text-muted {
		margin-bottom: var(--space-6);
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
