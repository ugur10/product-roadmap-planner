<script lang="ts">
	import type { Feature, Priority, Status, Category } from '../types.js';
	import { featuresStore } from '../stores/features.svelte.js';
	import FeatureCard from './FeatureCard.svelte';
	import FeatureForm from './FeatureForm.svelte';

	interface Props {
		showFilters?: boolean;
	}

	let { showFilters = true }: Props = $props();

	let showForm = $state(false);
	let editingFeature = $state(null);

	const priorityOptions: { value: Priority | 'all'; label: string }[] = [
		{ value: 'all', label: 'All Priorities' },
		{ value: 'critical', label: 'Critical' },
		{ value: 'high', label: 'High' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'low', label: 'Low' }
	];

	const statusOptions: { value: Status | 'all'; label: string }[] = [
		{ value: 'all', label: 'All Statuses' },
		{ value: 'planning', label: 'Planning' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'testing', label: 'Testing' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'on_hold', label: 'On Hold' }
	];

	const categoryOptions: { value: Category | 'all'; label: string }[] = [
		{ value: 'all', label: 'All Categories' },
		{ value: 'frontend', label: 'Frontend' },
		{ value: 'backend', label: 'Backend' },
		{ value: 'infrastructure', label: 'Infrastructure' },
		{ value: 'design', label: 'Design' },
		{ value: 'research', label: 'Research' },
		{ value: 'other', label: 'Other' }
	];

	function handleAddFeature() {
		editingFeature = null;
		showForm = true;
	}

	function handleEditFeature(feature: Feature) {
		editingFeature = feature;
		showForm = true;
	}

	function handleCloseForm() {
		showForm = false;
		editingFeature = null;
	}

	function handleClearFilters() {
		featuresStore.clearFilters();
	}

	const hasActiveFilters = $derived(() => {
		const filters = featuresStore.filters;
		return filters.search !== '' ||
			   filters.priority !== 'all' ||
			   filters.status !== 'all' ||
			   filters.category !== 'all';
	});

	const sortedFeatures = $derived(() => {
		return [...featuresStore.filteredFeatures()].sort((a, b) => {
			// Sort by priority first (critical > high > medium > low)
			const priorityOrder: Record<Priority, number> = { critical: 0, high: 1, medium: 2, low: 3 };
			const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
			if (priorityDiff !== 0) return priorityDiff;

			// Then by due date (closest first, no due date last)
			if (a.dueDate && b.dueDate) {
				return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
			}
			if (a.dueDate && !b.dueDate) return -1;
			if (!a.dueDate && b.dueDate) return 1;

			// Finally by creation date (newest first)
			return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
		});
	});
</script>

<div class="features-list">
	{#if showFilters}
		<div class="filters-section">
			<div class="filters-header">
				<h3>Filters</h3>
				{#if hasActiveFilters()}
					<button class="btn btn-secondary btn-sm" onclick={handleClearFilters}>
						Clear All
					</button>
				{/if}
			</div>

			<div class="filters-grid">
				<div class="filter-group">
					<label for="search">Search</label>
					<input
						id="search"
						type="text"
						placeholder="Search features..."
						bind:value={featuresStore.filters.search}
					/>
				</div>

				<div class="filter-group">
					<label for="priority-filter">Priority</label>
					<select
						id="priority-filter"
						bind:value={featuresStore.filters.priority}
					>
						{#each priorityOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="filter-group">
					<label for="status-filter">Status</label>
					<select
						id="status-filter"
						bind:value={featuresStore.filters.status}
					>
						{#each statusOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="filter-group">
					<label for="category-filter">Category</label>
					<select
						id="category-filter"
						bind:value={featuresStore.filters.category}
					>
						{#each categoryOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
	{/if}

	<div class="features-header">
		<div class="features-count">
			{#if hasActiveFilters()}
				Showing {sortedFeatures().length} of {featuresStore.features.length} features
			{:else}
				{sortedFeatures().length} features
			{/if}
		</div>
		<button class="btn btn-primary" onclick={handleAddFeature}>
			<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<circle cx="12" cy="12" r="10"></circle>
				<line x1="12" y1="8" x2="12" y2="16"></line>
				<line x1="8" y1="12" x2="16" y2="12"></line>
			</svg>
			Add Feature
		</button>
	</div>

	<div class="features-grid">
		{#each sortedFeatures() as feature (feature.id)}
			<FeatureCard
				{feature}
				onEdit={handleEditFeature}
				onView={handleEditFeature}
			/>
		{:else}
			<div class="empty-state">
				<div class="empty-icon">📋</div>
				<h3>No features found</h3>
				{#if hasActiveFilters()}
					<p>Try adjusting your filters or <button class="link-button" onclick={handleClearFilters}>clear all filters</button></p>
				{:else}
					<p>Get started by adding your first feature</p>
				{/if}
				<button class="btn btn-primary" onclick={handleAddFeature}>
					Add Your First Feature
				</button>
			</div>
		{/each}
	</div>
</div>

{#if showForm}
	<FeatureForm
		feature={editingFeature}
		onClose={handleCloseForm}
	/>
{/if}

<style>
	.features-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.filters-section {
		background: white;
		border: 1px solid var(--gray-200);
		border-radius: var(--radius-lg);
		padding: var(--space-4);
	}

	.filters-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.filters-header h3 {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.filters-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
	}

	.filter-group {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.filter-group label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text);
	}

	.filter-group input,
	.filter-group select {
		padding: var(--space-2) var(--space-3);
		border: 1px solid var(--gray-300);
		border-radius: var(--radius);
		font-size: var(--font-size-sm);
		transition: border-color 0.2s;
	}

	.filter-group input:focus,
	.filter-group select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.features-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-4);
	}

	.features-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.btn {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
	}

	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: var(--space-4);
	}

	.empty-state {
		grid-column: 1 / -1;
		text-align: center;
		padding: var(--space-8) var(--space-4);
		background: white;
		border: 2px dashed var(--gray-200);
		border-radius: var(--radius-lg);
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
		opacity: 0.5;
	}

	.empty-state h3 {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--font-size-xl);
		color: var(--color-text);
	}

	.empty-state p {
		margin: 0 0 var(--space-6) 0;
		color: var(--color-text-muted);
	}

	.link-button {
		background: none;
		border: none;
		color: var(--color-primary);
		text-decoration: underline;
		cursor: pointer;
		font-size: inherit;
		padding: 0;
	}

	.link-button:hover {
		color: var(--color-primary-dark);
	}

	@media (max-width: 768px) {
		.filters-grid {
			grid-template-columns: 1fr;
		}

		.features-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--space-3);
		}

		.features-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 640px) {
		.filters-section {
			padding: var(--space-3);
		}

		.filters-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--space-3);
		}
	}
</style>