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

	function getPriorityStyle(priority: Feature['priority']): { background: string; color: string; gradient: string } {
		switch (priority) {
			case 'critical':
				return {
					background: 'var(--color-danger-light)',
					color: 'var(--color-danger)',
					gradient: 'var(--gradient-danger)'
				};
			case 'high':
				return {
					background: 'var(--amber-100)',
					color: 'var(--amber-700)',
					gradient: 'var(--gradient-warning)'
				};
			case 'medium':
				return {
					background: 'var(--color-primary-light)',
					color: 'var(--color-primary)',
					gradient: 'var(--gradient-primary)'
				};
			case 'low':
				return {
					background: 'var(--color-success-light)',
					color: 'var(--color-success)',
					gradient: 'var(--gradient-success)'
				};
			default:
				return {
					background: 'var(--gray-100)',
					color: 'var(--color-text-muted)',
					gradient: 'var(--gradient-subtle)'
				};
		}
	}

	function getStatusStyle(status: Feature['status']): { background: string; color: string; icon: string } {
		switch (status) {
			case 'completed':
				return {
					background: 'var(--color-success-light)',
					color: 'var(--color-success)',
					icon: '✓'
				};
			case 'in_progress':
				return {
					background: 'var(--color-primary-light)',
					color: 'var(--color-primary)',
					icon: '⚡'
				};
			case 'testing':
				return {
					background: 'var(--color-info-light)',
					color: 'var(--color-info)',
					icon: '🧪'
				};
			case 'planning':
				return {
					background: 'var(--gray-100)',
					color: 'var(--color-text-muted)',
					icon: '📋'
				};
			case 'on_hold':
				return {
					background: 'var(--color-danger-light)',
					color: 'var(--color-danger)',
					icon: '⏸'
				};
			default:
				return {
					background: 'var(--gray-100)',
					color: 'var(--color-text-muted)',
					icon: '•'
				};
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
					class="badge priority-badge"
					style="background: {getPriorityStyle(feature.priority).background}; color: {getPriorityStyle(feature.priority).color}; border: 1px solid {getPriorityStyle(feature.priority).color}25;"
				>
					<span class="badge-dot" style="background: {getPriorityStyle(feature.priority).gradient};"></span>
					{formatPriority(feature.priority)}
				</span>
				<span
					class="badge status-badge"
					style="background: {getStatusStyle(feature.status).background}; color: {getStatusStyle(feature.status).color}; border: 1px solid {getStatusStyle(feature.status).color}25;"
				>
					<span class="badge-icon">{getStatusStyle(feature.status).icon}</span>
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
		background: var(--color-surface);
		border: 1px solid var(--color-border-subtle);
		border-radius: var(--radius-xl);
		box-shadow: var(--shadow-sm);
		transition: all var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1);
		overflow: hidden;
		position: relative;
	}

	.feature-card::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--gradient-subtle);
		opacity: 0;
		transition: opacity var(--duration-300) ease;
		pointer-events: none;
		z-index: 0;
	}

	.feature-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
		border-color: var(--color-border);
	}

	.feature-card:hover::before {
		opacity: 0.5;
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
		padding: var(--space-5);
		border-bottom: 1px solid var(--color-border-subtle);
		position: relative;
		z-index: 1;
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
		display: inline-flex;
		align-items: center;
		gap: var(--space-1-5);
		padding: var(--space-1-5) var(--space-3);
		border-radius: var(--radius-full);
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-semibold);
		text-transform: uppercase;
		letter-spacing: 0.025em;
		transition: all var(--duration-200) ease;
		box-shadow: var(--shadow-xs);
		backdrop-filter: blur(4px);
	}

	.badge:hover {
		transform: translateY(-1px);
		box-shadow: var(--shadow-sm);
	}

	.badge-dot {
		width: 6px;
		height: 6px;
		border-radius: var(--radius-full);
		flex-shrink: 0;
	}

	.badge-icon {
		font-size: 10px;
		line-height: 1;
		flex-shrink: 0;
	}

	.priority-badge {
		position: relative;
		overflow: hidden;
	}

	.priority-badge::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: inherit;
		opacity: 0.1;
		border-radius: inherit;
	}

	.status-badge {
		backdrop-filter: blur(8px);
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
		padding: var(--space-5);
		position: relative;
		z-index: 1;
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
		padding: var(--space-3) var(--space-5);
		background: var(--gradient-subtle);
		border-top: 1px solid var(--color-border-subtle);
		font-size: var(--font-size-xs);
		color: var(--color-text-subtle);
		position: relative;
		z-index: 1;
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
