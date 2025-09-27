<script lang="ts">
	import type { Feature, Priority, Status, Category, ImpactScore, EffortScore } from '../types.js';
	import { featuresStore } from '../stores/features.svelte.js';
	import { getDefaultMatrixPosition, updateFeaturePriority } from '../utils/matrix.js';

	interface Props {
		feature?: Feature | null;
		onClose: () => void;
		onSave?: (feature: Feature) => void;
	}

	let { feature = null, onClose, onSave }: Props = $props();

	let title = $state(feature?.title || '');
	let description = $state(feature?.description || '');
	let priority = $state<Priority>(feature?.priority || 'medium');
	let status = $state<Status>(feature?.status || 'planning');
	let category = $state<Category>(feature?.category || 'frontend');
	let estimatedHours = $state(feature?.estimatedHours || 8);
	let assignee = $state(feature?.assignee || '');
	let dueDate = $state(feature?.dueDate || '');
	let impact = $state<ImpactScore>(feature?.matrix?.impact || 3);
	let effort = $state<EffortScore>(feature?.matrix?.effort || 3);

	let errors = $state<Record<string, string>>({});

	const priorityOptions: { value: Priority; label: string }[] = [
		{ value: 'low', label: 'Low' },
		{ value: 'medium', label: 'Medium' },
		{ value: 'high', label: 'High' },
		{ value: 'critical', label: 'Critical' }
	];

	const statusOptions: { value: Status; label: string }[] = [
		{ value: 'planning', label: 'Planning' },
		{ value: 'in_progress', label: 'In Progress' },
		{ value: 'testing', label: 'Testing' },
		{ value: 'completed', label: 'Completed' },
		{ value: 'on_hold', label: 'On Hold' }
	];

	const categoryOptions: { value: Category; label: string }[] = [
		{ value: 'frontend', label: 'Frontend' },
		{ value: 'backend', label: 'Backend' },
		{ value: 'infrastructure', label: 'Infrastructure' },
		{ value: 'design', label: 'Design' },
		{ value: 'research', label: 'Research' },
		{ value: 'other', label: 'Other' }
	];

	function validate(): boolean {
		errors = {};

		if (!title.trim()) {
			errors.title = 'Title is required';
		}

		if (!description.trim()) {
			errors.description = 'Description is required';
		}

		if (estimatedHours <= 0) {
			errors.estimatedHours = 'Estimated hours must be greater than 0';
		}

		if (dueDate && new Date(dueDate) < new Date()) {
			errors.dueDate = 'Due date cannot be in the past';
		}

		return Object.keys(errors).length === 0;
	}

	function handleSubmit() {
		if (!validate()) return;

		const featureData = {
			title: title.trim(),
			description: description.trim(),
			priority,
			status,
			category,
			estimatedHours,
			assignee: assignee.trim() || undefined,
			dueDate: dueDate || undefined,
			matrix: { impact, effort }
		};

		let savedFeature: Feature;

		if (feature) {
			// Update existing feature
			savedFeature = featuresStore.updateFeature(feature.id, featureData)!;
		} else {
			// Create new feature
			savedFeature = featuresStore.addFeature(featureData);
		}

		onSave?.(savedFeature);
		onClose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<div
	class="modal-overlay"
	onclick={(e) => e.target === e.currentTarget && onClose()}
	onkeydown={(e) => e.key === 'Escape' && onClose()}
	role="dialog"
	aria-modal="true"
	tabindex="-1"
>
	<div class="modal" role="document">
		<div class="modal-header">
			<h2>{feature ? 'Edit Feature' : 'Add New Feature'}</h2>
			<button class="btn-close" onclick={onClose} aria-label="Close">×</button>
		</div>

		<form class="modal-body" onsubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
			<div class="form-group">
				<label for="title">Title *</label>
				<input
					id="title"
					type="text"
					bind:value={title}
					class:error={errors.title}
					placeholder="Enter feature title"
					required
				/>
				{#if errors.title}
					<span class="error-message">{errors.title}</span>
				{/if}
			</div>

			<div class="form-group">
				<label for="description">Description *</label>
				<textarea
					id="description"
					bind:value={description}
					class:error={errors.description}
					placeholder="Describe the feature in detail"
					rows="3"
					required
				></textarea>
				{#if errors.description}
					<span class="error-message">{errors.description}</span>
				{/if}
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="priority">Priority</label>
					<select id="priority" bind:value={priority}>
						{#each priorityOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="status">Status</label>
					<select id="status" bind:value={status}>
						{#each statusOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="category">Category</label>
					<select id="category" bind:value={category}>
						{#each categoryOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</div>
			</div>

			<div class="form-row">
				<div class="form-group">
					<label for="estimatedHours">Estimated Hours *</label>
					<input
						id="estimatedHours"
						type="number"
						bind:value={estimatedHours}
						class:error={errors.estimatedHours}
						min="1"
						step="0.5"
						required
					/>
					{#if errors.estimatedHours}
						<span class="error-message">{errors.estimatedHours}</span>
					{/if}
				</div>

				<div class="form-group">
					<label for="assignee">Assignee</label>
					<input
						id="assignee"
						type="text"
						bind:value={assignee}
						placeholder="Enter assignee name"
					/>
				</div>
			</div>

			<div class="form-group">
				<label for="dueDate">Due Date</label>
				<input
					id="dueDate"
					type="date"
					bind:value={dueDate}
					class:error={errors.dueDate}
				/>
				{#if errors.dueDate}
					<span class="error-message">{errors.dueDate}</span>
				{/if}
			</div>

			<div class="form-section">
				<h4>Priority Matrix</h4>
				<p class="form-section-desc">Impact and effort scores for strategic prioritization</p>

				<div class="form-row">
					<div class="form-group">
						<label for="impact">Impact (1-5)</label>
						<select id="impact" bind:value={impact}>
							<option value={1}>1 - Minimal</option>
							<option value={2}>2 - Low</option>
							<option value={3}>3 - Medium</option>
							<option value={4}>4 - High</option>
							<option value={5}>5 - Critical</option>
						</select>
						<span class="field-hint">How much business value will this create?</span>
					</div>

					<div class="form-group">
						<label for="effort">Effort (1-5)</label>
						<select id="effort" bind:value={effort}>
							<option value={1}>1 - Minimal</option>
							<option value={2}>2 - Low</option>
							<option value={3}>3 - Medium</option>
							<option value={4}>4 - High</option>
							<option value={5}>5 - Extensive</option>
						</select>
						<span class="field-hint">How much time and resources will this require?</span>
					</div>
				</div>
			</div>

			<div class="modal-footer">
				<button type="button" class="btn btn-secondary" onclick={onClose}>
					Cancel
				</button>
				<button type="submit" class="btn btn-primary">
					{feature ? 'Update' : 'Create'} Feature
				</button>
			</div>
		</form>
	</div>
</div>

<style>
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: var(--space-4);
	}

	.modal {
		background: white;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xl);
		width: 100%;
		max-width: 600px;
		max-height: 90vh;
		overflow: auto;
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-6);
		border-bottom: 1px solid var(--gray-200);
	}

	.modal-header h2 {
		margin: 0;
		font-size: var(--font-size-xl);
		font-weight: 600;
	}

	.btn-close {
		background: none;
		border: none;
		font-size: 1.5rem;
		cursor: pointer;
		padding: var(--space-2);
		border-radius: var(--radius);
		color: var(--color-text-muted);
		transition: all 0.2s;
	}

	.btn-close:hover {
		background: var(--gray-100);
		color: var(--color-text);
	}

	.modal-body {
		padding: var(--space-6);
	}

	.form-group {
		margin-bottom: var(--space-4);
	}

	.form-row {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: var(--space-4);
	}

	label {
		display: block;
		margin-bottom: var(--space-2);
		font-weight: 500;
		color: var(--color-text);
	}

	input,
	textarea,
	select {
		width: 100%;
		padding: var(--space-3);
		border: 1px solid var(--gray-300);
		border-radius: var(--radius);
		font-size: var(--font-size-base);
		transition: border-color 0.2s;
	}

	input:focus,
	textarea:focus,
	select:focus {
		outline: none;
		border-color: var(--color-primary);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	input.error,
	textarea.error {
		border-color: var(--color-danger);
	}

	.error-message {
		display: block;
		margin-top: var(--space-1);
		font-size: var(--font-size-sm);
		color: var(--color-danger);
	}

	.form-section {
		margin-top: var(--space-6);
		padding-top: var(--space-4);
		border-top: 1px solid var(--gray-200);
	}

	.form-section h4 {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text);
	}

	.form-section-desc {
		margin: 0 0 var(--space-4) 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		line-height: 1.4;
	}

	.field-hint {
		display: block;
		margin-top: var(--space-1);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		line-height: 1.3;
	}

	.modal-footer {
		display: flex;
		justify-content: flex-end;
		gap: var(--space-3);
		margin-top: var(--space-6);
		padding-top: var(--space-4);
		border-top: 1px solid var(--gray-200);
	}

	@media (max-width: 640px) {
		.modal {
			margin: var(--space-4);
		}

		.modal-header,
		.modal-body {
			padding: var(--space-4);
		}

		.form-row {
			grid-template-columns: 1fr;
		}

		.modal-footer {
			flex-direction: column;
		}
	}
</style>