<script lang="ts">
	import { featuresStore } from '$lib/stores/features.svelte.js';

	// Generate quarters for the timeline
	function generateQuarters() {
		const currentYear = new Date().getFullYear();
		const quarters = [];

		for (let year = currentYear; year <= currentYear + 1; year++) {
			for (let q = 1; q <= 4; q++) {
				quarters.push({
					id: `${year}-Q${q}`,
					year,
					quarter: q,
					label: `Q${q} ${year}`,
					startMonth: (q - 1) * 3,
					endMonth: q * 3 - 1
				});
			}
		}

		return quarters;
	}

	const quarters = generateQuarters();

	// Group features by quarter based on due date
	const featuresByQuarter = $derived.by(() => {
		const grouped: Record<string, any[]> = {};

		// Initialize all quarters
		quarters.forEach((quarter) => {
			grouped[quarter.id] = [];
		});
		grouped['backlog'] = [];

		// Group features by quarter
		featuresStore.features.forEach((feature) => {
			if (feature.dueDate) {
				const dueDate = new Date(feature.dueDate);
				const year = dueDate.getFullYear();
				const month = dueDate.getMonth();
				const quarter = Math.floor(month / 3) + 1;
				const quarterId = `${year}-Q${quarter}`;

				if (grouped[quarterId]) {
					grouped[quarterId].push(feature);
				}
			} else {
				// Features without due dates go to backlog
				grouped['backlog'].push(feature);
			}
		});

		return grouped;
	});

	// Get status color for feature cards
	function getStatusColor(status: string) {
		switch (status) {
			case 'completed':
				return 'var(--green-500)';
			case 'in_progress':
				return 'var(--blue-500)';
			case 'testing':
				return 'var(--amber-500)';
			case 'on_hold':
				return 'var(--red-500)';
			default:
				return 'var(--gray-500)';
		}
	}

	// Get priority styling
	function getPriorityClass(priority: string) {
		switch (priority) {
			case 'critical':
				return 'priority-critical';
			case 'high':
				return 'priority-high';
			case 'medium':
				return 'priority-medium';
			default:
				return 'priority-low';
		}
	}

	// Drag and drop functionality
	let draggedFeature: any = $state(null);
	let dragOverQuarter: string | null = $state(null);

	function handleDragStart(event: DragEvent, feature: any) {
		draggedFeature = feature;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', feature.id);
		}
	}

	function handleDragOver(event: DragEvent) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}
	}

	function handleDragEnter(event: DragEvent, quarterId: string) {
		event.preventDefault();
		dragOverQuarter = quarterId;
	}

	function handleDragLeave(event: DragEvent) {
		// Only remove highlight if we're really leaving the container
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		if (
			event.clientX < rect.left ||
			event.clientX > rect.right ||
			event.clientY < rect.top ||
			event.clientY > rect.bottom
		) {
			dragOverQuarter = null;
		}
	}

	function handleDrop(event: DragEvent, targetQuarterId: string) {
		event.preventDefault();
		dragOverQuarter = null;

		if (draggedFeature) {
			// Calculate new due date based on target quarter
			let newDueDate: string | undefined;

			if (targetQuarterId === 'backlog') {
				newDueDate = undefined;
			} else {
				const [year, quarterStr] = targetQuarterId.split('-Q');
				const quarter = parseInt(quarterStr);
				const quarterEndMonth = quarter * 3 - 1; // 2, 5, 8, 11 for Q1-Q4
				const dueDate = new Date(parseInt(year), quarterEndMonth, 28); // End of quarter
				newDueDate = dueDate.toISOString().split('T')[0];
			}

			// Update the feature with new due date
			featuresStore.updateFeature(draggedFeature.id, {
				dueDate: newDueDate
			});

			draggedFeature = null;
		}
	}

	function handleDragEnd() {
		draggedFeature = null;
		dragOverQuarter = null;
	}
</script>

<div class="page">
	<header class="page-header">
		<h1>Roadmap Timeline</h1>
		<p class="text-muted">Quarterly view of feature development timeline</p>
	</header>

	<div class="timeline-container">
		<!-- Backlog Section -->
		<div
			class="quarter-section backlog {dragOverQuarter === 'backlog' ? 'drag-over' : ''}"
			role="region"
			aria-label="Backlog - Drop zone for unscheduled features"
			ondragover={handleDragOver}
			ondragenter={(e) => handleDragEnter(e, 'backlog')}
			ondragleave={handleDragLeave}
			ondrop={(e) => handleDrop(e, 'backlog')}
		>
			<div class="quarter-header">
				<h3>Backlog</h3>
				<span class="feature-count">{featuresByQuarter['backlog']?.length || 0} features</span>
			</div>
			<div class="features-container">
				{#each featuresByQuarter['backlog'] || [] as feature (feature.id)}
					<div
						class="feature-card {getPriorityClass(feature.priority)}"
						role="button"
						tabindex="0"
						aria-label="Feature: {feature.title} - Drag to move between quarters"
						draggable="true"
						ondragstart={(e) => handleDragStart(e, feature)}
						ondragend={handleDragEnd}
					>
						<div
							class="feature-status"
							style="background-color: {getStatusColor(feature.status)}"
						></div>
						<div class="feature-content">
							<h4>{feature.title}</h4>
							<p class="feature-description">{feature.description}</p>
							<div class="feature-meta">
								<span class="feature-assignee">{feature.assignee || 'Unassigned'}</span>
								<span class="feature-hours">{feature.estimatedHours}h</span>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Quarterly Timeline -->
		<div class="timeline">
			{#each quarters as quarter (quarter.id)}
				<div
					class="quarter-section {dragOverQuarter === quarter.id ? 'drag-over' : ''}"
					role="region"
					aria-label="{quarter.label} - Drop zone for features scheduled in this quarter"
					ondragover={handleDragOver}
					ondragenter={(e) => handleDragEnter(e, quarter.id)}
					ondragleave={handleDragLeave}
					ondrop={(e) => handleDrop(e, quarter.id)}
				>
					<div class="quarter-header">
						<h3>{quarter.label}</h3>
						<span class="feature-count">{featuresByQuarter[quarter.id]?.length || 0} features</span>
					</div>
					<div class="features-container">
						{#each featuresByQuarter[quarter.id] || [] as feature (feature.id)}
							<div
								class="feature-card {getPriorityClass(feature.priority)}"
								role="button"
								tabindex="0"
								aria-label="Feature: {feature.title} - Drag to move between quarters"
								draggable="true"
								ondragstart={(e) => handleDragStart(e, feature)}
								ondragend={handleDragEnd}
							>
								<div
									class="feature-status"
									style="background-color: {getStatusColor(feature.status)}"
								></div>
								<div class="feature-content">
									<h4>{feature.title}</h4>
									<p class="feature-description">{feature.description}</p>
									<div class="feature-meta">
										<span class="feature-assignee">{feature.assignee || 'Unassigned'}</span>
										<span class="feature-hours">{feature.estimatedHours}h</span>
										{#if feature.dueDate}
											<span class="feature-due"
												>{new Date(feature.dueDate).toLocaleDateString()}</span
											>
										{/if}
									</div>
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.page {
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--space-4);
	}

	.page-header {
		margin-bottom: var(--space-8);
	}

	.page-header h1 {
		margin-bottom: var(--space-2);
	}

	.timeline-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.timeline {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-4);
		margin-top: var(--space-4);
	}

	.quarter-section {
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: var(--space-4);
		min-height: 400px;
	}

	.quarter-section.backlog {
		background: var(--gray-50);
		border: 2px dashed var(--gray-300);
	}

	.quarter-section.drag-over {
		background: rgba(59, 130, 246, 0.05);
		border-color: var(--blue-500);
		transform: scale(1.02);
		transition: all 0.2s ease;
	}

	.quarter-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
		padding-bottom: var(--space-3);
		border-bottom: 1px solid var(--color-border);
	}

	.quarter-header h3 {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 600;
	}

	.feature-count {
		background: var(--gray-100);
		color: var(--gray-600);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius);
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	.features-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.feature-card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: var(--space-4);
		box-shadow: var(--shadow);
		transition: all 0.2s ease;
		cursor: grab;
		position: relative;
	}

	.feature-card:hover {
		box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.1);
		transform: translateY(-1px);
	}

	.feature-card:active {
		cursor: grabbing;
	}

	.feature-card[draggable='true']:active {
		opacity: 0.5;
		transform: rotate(5deg);
		z-index: 1000;
	}

	.feature-status {
		position: absolute;
		top: 0;
		left: 0;
		width: 4px;
		height: 100%;
		border-radius: var(--radius) 0 0 var(--radius);
	}

	.feature-content {
		margin-left: var(--space-3);
	}

	.feature-card h4 {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--font-size-base);
		font-weight: 600;
		line-height: 1.4;
	}

	.feature-description {
		margin: 0 0 var(--space-3) 0;
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		line-height: 1.4;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.feature-meta {
		display: flex;
		gap: var(--space-3);
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		flex-wrap: wrap;
	}

	.feature-assignee::before {
		content: '👤 ';
	}

	.feature-hours::before {
		content: '⏱️ ';
	}

	.feature-due::before {
		content: '📅 ';
	}

	/* Priority styling */
	.priority-critical {
		border-left: 4px solid var(--red-500);
	}

	.priority-high {
		border-left: 4px solid var(--amber-500);
	}

	.priority-medium {
		border-left: 4px solid var(--blue-500);
	}

	.priority-low {
		border-left: 4px solid var(--gray-400);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.timeline {
			grid-template-columns: 1fr;
		}

		.page {
			padding: 0 var(--space-3);
		}

		.timeline-container {
			gap: var(--space-4);
		}
	}
</style>
