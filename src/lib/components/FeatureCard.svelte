<script lang="ts">
	import type { Feature } from '../types.js';
	import { featuresStore } from '../stores/features.svelte.js';

	interface Props {
		feature: Feature;
		onEdit?: (feature: Feature) => void;
		onView?: (feature: Feature) => void;
	}

	let { feature, onEdit, onView }: Props = $props();

	function handleDelete() {
		if (confirm(`Are you sure you want to delete "${feature.title}"?`)) {
			featuresStore.deleteFeature(feature.id);
		}
	}

	function getPriorityColor(priority: Feature['priority']): string {
		switch (priority) {
			case 'critical':
				return 'var(--color-danger)';
			case 'high':
				return 'var(--color-warning)';
			case 'medium':
				return 'var(--color-primary)';
			case 'low':
				return 'var(--color-success)';
			default:
				return 'var(--color-text-muted)';
		}
	}

	function getStatusColor(status: Feature['status']): string {
		switch (status) {
			case 'completed':
				return 'var(--color-success)';
			case 'in_progress':
				return 'var(--color-primary)';
			case 'testing':
				return 'var(--color-warning)';
			case 'planning':
				return 'var(--color-text-muted)';
			case 'on_hold':
				return 'var(--color-danger)';
			default:
				return 'var(--color-text-muted)';
		}
	}

	function formatDate(dateString: string): string {
		return new Date(dateString).toLocaleDateString();
	}

	function formatStatus(status: Feature['status']): string {
		return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
	}

	function formatPriority(priority: Feature['priority']): string {
		return priority.charAt(0).toUpperCase() + priority.slice(1);
	}

	function formatCategory(category: Feature['category']): string {
		return category.charAt(0).toUpperCase() + category.slice(1);
	}

	const isDueSoon = $derived(() => {
		if (!feature.dueDate) return false;
		const dueDate = new Date(feature.dueDate);
		const today = new Date();
		const diffTime = dueDate.getTime() - today.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
		return diffDays <= 3 && diffDays >= 0;
	});

	const isOverdue = $derived(() => {
		if (!feature.dueDate) return false;
		const dueDate = new Date(feature.dueDate);
		const today = new Date();
		return dueDate < today && feature.status !== 'completed';
	});
</script>

<div class="feature-card" class:due-soon={isDueSoon} class:overdue={isOverdue}>
	<div class="card-header">
		<div class="card-title">
			<button class="title-button" onclick={() => onView?.(feature)} type="button">
				<h3>{feature.title}</h3>
			</button>
			<div class="badges">
				<span
					class="badge priority"
					style="background-color: {getPriorityColor(feature.priority)}20; color: {getPriorityColor(
						feature.priority
					)}"
				>
					{formatPriority(feature.priority)}
				</span>
				<span
					class="badge status"
					style="background-color: {getStatusColor(feature.status)}20; color: {getStatusColor(
						feature.status
					)}"
				>
					{formatStatus(feature.status)}
				</span>
			</div>
		</div>
		<div class="card-actions">
			<button class="btn-icon" onclick={() => onEdit?.(feature)} aria-label="Edit feature">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
					<path d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
				</svg>
			</button>
			<button class="btn-icon btn-danger" onclick={handleDelete} aria-label="Delete feature">
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
				>
					<polyline points="3,6 5,6 21,6"></polyline>
					<path
						d="m19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"
					></path>
				</svg>
			</button>
		</div>
	</div>

	<div class="card-body">
		<p class="description">{feature.description}</p>

		<div class="card-meta">
			<div class="meta-item">
				<span class="meta-label">Category:</span>
				<span class="meta-value">{formatCategory(feature.category)}</span>
			</div>
			<div class="meta-item">
				<span class="meta-label">Estimated:</span>
				<span class="meta-value">{feature.estimatedHours}h</span>
			</div>
			{#if feature.assignee}
				<div class="meta-item">
					<span class="meta-label">Assignee:</span>
					<span class="meta-value">{feature.assignee}</span>
				</div>
			{/if}
			{#if feature.dueDate}
				<div class="meta-item">
					<span class="meta-label">Due:</span>
					<span class="meta-value" class:warning={isDueSoon} class:danger={isOverdue}>
						{formatDate(feature.dueDate)}
					</span>
				</div>
			{/if}
		</div>
	</div>

	<div class="card-footer">
		<span class="created-date">Created {formatDate(feature.createdAt)}</span>
		{#if feature.updatedAt !== feature.createdAt}
			<span class="updated-date">• Updated {formatDate(feature.updatedAt)}</span>
		{/if}
	</div>
</div>

<style>
	.feature-card {
		background: white;
		border: 1px solid var(--gray-200);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
		transition: all 0.2s;
		overflow: hidden;
	}

	.feature-card:hover {
		box-shadow: var(--shadow-md);
		border-color: var(--gray-300);
	}

	.feature-card.due-soon {
		border-left: 4px solid var(--color-warning);
	}

	.feature-card.overdue {
		border-left: 4px solid var(--color-danger);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		padding: var(--space-4);
		border-bottom: 1px solid var(--gray-100);
	}

	.card-title {
		flex: 1;
	}

	.title-button {
		background: none;
		border: none;
		padding: 0;
		text-align: left;
		cursor: pointer;
		width: 100%;
	}

	.title-button h3 {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text);
		transition: color 0.2s;
	}

	.title-button:hover h3 {
		color: var(--color-primary);
	}

	.badges {
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

	.card-actions {
		display: flex;
		gap: var(--space-1);
		margin-left: var(--space-3);
	}

	.btn-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background: none;
		border-radius: var(--radius);
		cursor: pointer;
		color: var(--color-text-muted);
		transition: all 0.2s;
	}

	.btn-icon:hover {
		background: var(--gray-100);
		color: var(--color-text);
	}

	.btn-icon.btn-danger:hover {
		background: var(--color-danger);
		color: white;
	}

	.card-body {
		padding: var(--space-4);
	}

	.description {
		margin: 0 0 var(--space-4) 0;
		color: var(--color-text-muted);
		line-height: 1.5;
	}

	.card-meta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
		gap: var(--space-2);
	}

	.meta-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.meta-label {
		font-size: var(--font-size-xs);
		font-weight: 500;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.meta-value {
		font-size: var(--font-size-sm);
		color: var(--color-text);
	}

	.meta-value.warning {
		color: var(--color-warning);
		font-weight: 500;
	}

	.meta-value.danger {
		color: var(--color-danger);
		font-weight: 500;
	}

	.card-footer {
		padding: var(--space-3) var(--space-4);
		background: var(--gray-50);
		border-top: 1px solid var(--gray-100);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	@media (max-width: 640px) {
		.card-header {
			flex-direction: column;
			align-items: stretch;
			gap: var(--space-3);
		}

		.card-actions {
			align-self: flex-end;
			margin-left: 0;
		}

		.card-meta {
			grid-template-columns: 1fr;
		}

		.meta-item {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}
</style>
