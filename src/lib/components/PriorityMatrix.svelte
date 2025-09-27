<script lang="ts">
	import type { Feature, ImpactScore, EffortScore } from '../types.js';
	import { featuresStore } from '../stores/features.svelte.js';
	import {
		getMatrixQuadrant,
		getQuadrantName,
		getQuadrantDescription,
		getQuadrantColor,
		scoresToCoordinates,
		coordinatesToScores,
		updateFeaturePriority
	} from '../utils/matrix.js';

	interface Props {
		onFeatureSelect?: (feature: Feature) => void;
	}

	let { onFeatureSelect }: Props = $props();

	let matrixElement: HTMLDivElement;
	let draggedFeature: Feature | null = $state(null);
	let isDragging = $state(false);

	// Get features with matrix positions, assigning defaults where missing
	const matrixFeatures = $derived(() => {
		return featuresStore.features.map(feature => {
			if (!feature.matrix) {
				return {
					...feature,
					matrix: { impact: 3 as ImpactScore, effort: 3 as EffortScore }
				};
			}
			return feature;
		});
	});

	function handleFeatureMouseDown(event: MouseEvent, feature: Feature) {
		if (event.button !== 0) return; // Only left click

		draggedFeature = feature;
		isDragging = true;

		const handleMouseMove = (e: MouseEvent) => {
			if (!draggedFeature || !matrixElement) return;

			const rect = matrixElement.getBoundingClientRect();
			const x = ((e.clientX - rect.left) / rect.width) * 100;
			const y = ((e.clientY - rect.top) / rect.height) * 100;

			// Clamp to matrix bounds
			const clampedX = Math.max(0, Math.min(100, x));
			const clampedY = Math.max(0, Math.min(100, y));

			const { impact, effort } = coordinatesToScores(clampedX, clampedY);

			// Update feature position
			const updatedFeature = {
				...draggedFeature,
				matrix: { impact, effort, x: clampedX, y: clampedY }
			};

			featuresStore.updateFeature(draggedFeature.id, updatedFeature);
		};

		const handleMouseUp = () => {
			if (draggedFeature && draggedFeature.matrix) {
				// Update priority based on new position
				const updatedFeature = updateFeaturePriority(draggedFeature);
				featuresStore.updateFeature(draggedFeature.id, updatedFeature);
			}

			draggedFeature = null;
			isDragging = false;
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};

		document.addEventListener('mousemove', handleMouseMove);
		document.addEventListener('mouseup', handleMouseUp);
		event.preventDefault();
	}

	function getFeaturePosition(feature: Feature): { x: number; y: number } {
		if (!feature.matrix) return { x: 50, y: 50 };

		// Use custom position if available, otherwise calculate from scores
		if (feature.matrix.x !== undefined && feature.matrix.y !== undefined) {
			return { x: feature.matrix.x, y: feature.matrix.y };
		}

		return scoresToCoordinates(feature.matrix.impact, feature.matrix.effort);
	}

	function getFeatureColor(feature: Feature): string {
		if (!feature.matrix) return '#6b7280';
		const quadrant = getMatrixQuadrant(feature.matrix.impact, feature.matrix.effort);
		return getQuadrantColor(quadrant);
	}

	function handleFeatureClick(feature: Feature) {
		onFeatureSelect?.(feature);
	}

	// Quadrant data for labels
	const quadrants = [
		{ key: 'quick_wins', x: 25, y: 25 },
		{ key: 'major_projects', x: 75, y: 25 },
		{ key: 'fill_ins', x: 25, y: 75 },
		{ key: 'money_pit', x: 75, y: 75 }
	] as const;
</script>

<div class="matrix-container">
	<div class="matrix-header">
		<h3>Priority Matrix</h3>
		<p class="matrix-subtitle">Impact vs Effort Analysis</p>
	</div>

	<div class="matrix-wrapper">
		<!-- Y-axis label -->
		<div class="axis-label y-axis">
			<span>Impact</span>
			<div class="axis-scale">
				<span>High</span>
				<span>Low</span>
			</div>
		</div>

		<!-- Main matrix -->
		<div class="matrix" bind:this={matrixElement}>
			<!-- Grid lines -->
			<div class="grid-lines">
				<!-- Vertical lines -->
				{#each [20, 40, 60, 80] as x}
					<div class="grid-line vertical" style="left: {x}%"></div>
				{/each}
				<!-- Horizontal lines -->
				{#each [20, 40, 60, 80] as y}
					<div class="grid-line horizontal" style="top: {y}%"></div>
				{/each}
				<!-- Center lines -->
				<div class="grid-line vertical center" style="left: 50%"></div>
				<div class="grid-line horizontal center" style="top: 50%"></div>
			</div>

			<!-- Quadrant labels -->
			{#each quadrants as quadrant}
				<div
					class="quadrant-label"
					style="left: {quadrant.x}%; top: {quadrant.y}%; background-color: {getQuadrantColor(quadrant.key)}20"
				>
					<div class="quadrant-name" style="color: {getQuadrantColor(quadrant.key)}">
						{getQuadrantName(quadrant.key)}
					</div>
					<div class="quadrant-description">
						{getQuadrantDescription(quadrant.key)}
					</div>
				</div>
			{/each}

			<!-- Features -->
			{#each matrixFeatures() as feature (feature.id)}
				{@const position = getFeaturePosition(feature)}
				{@const color = getFeatureColor(feature)}
				<div
					class="feature-dot"
					class:dragging={isDragging && draggedFeature?.id === feature.id}
					style="left: {position.x}%; top: {position.y}%; background-color: {color}"
					onmousedown={(e) => handleFeatureMouseDown(e, feature)}
					onclick={() => handleFeatureClick(feature)}
					onkeydown={(e) => e.key === 'Enter' && handleFeatureClick(feature)}
					role="button"
					tabindex="0"
					aria-label="Feature: {feature.title} - Impact: {feature.matrix?.impact || 3}, Effort: {feature.matrix?.effort || 3}"
					title="{feature.title} - Impact: {feature.matrix?.impact || 3}, Effort: {feature.matrix?.effort || 3}"
				>
					<div class="feature-info">
						<div class="feature-title">{feature.title}</div>
						<div class="feature-priority">{feature.priority}</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- X-axis label -->
		<div class="axis-label x-axis">
			<span>Effort</span>
			<div class="axis-scale horizontal">
				<span>Low</span>
				<span>High</span>
			</div>
		</div>
	</div>

	<!-- Legend -->
	<div class="matrix-legend">
		<h4>Quadrants</h4>
		<div class="legend-items">
			{#each quadrants as quadrant}
				<div class="legend-item">
					<div class="legend-color" style="background-color: {getQuadrantColor(quadrant.key)}"></div>
					<div class="legend-text">
						<span class="legend-name">{getQuadrantName(quadrant.key)}</span>
						<span class="legend-desc">{getQuadrantDescription(quadrant.key)}</span>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	.matrix-container {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		max-width: 1200px;
		margin: 0 auto;
	}

	.matrix-header {
		text-align: center;
	}

	.matrix-header h3 {
		margin: 0 0 var(--space-2) 0;
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-text);
	}

	.matrix-subtitle {
		margin: 0;
		color: var(--color-text-muted);
		font-size: var(--font-size-base);
	}

	.matrix-wrapper {
		display: grid;
		grid-template-columns: 80px 600px;
		grid-template-rows: 600px 80px;
		gap: var(--space-4);
		margin: 0 auto;
		justify-content: center;
	}

	.axis-label {
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		color: var(--color-text);
		font-size: var(--font-size-sm);
	}

	.y-axis {
		writing-mode: vertical-rl;
		text-orientation: mixed;
		flex-direction: column;
	}

	.x-axis {
		grid-column: 2;
	}

	.axis-scale {
		display: flex;
		justify-content: space-between;
		margin-top: var(--space-2);
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
		font-weight: normal;
	}

	.axis-scale.horizontal {
		width: 100%;
		margin-top: var(--space-2);
	}

	.y-axis .axis-scale {
		writing-mode: horizontal-tb;
		flex-direction: column;
		height: 100px;
		margin-top: var(--space-4);
	}

	.matrix {
		position: relative;
		background: linear-gradient(135deg, #fafafa 0%, #ffffff 100%);
		border: 1px solid var(--gray-200);
		border-radius: var(--radius-xl);
		overflow: hidden;
		user-select: none;
		cursor: crosshair;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06),
			inset 0 1px 0 rgba(255, 255, 255, 0.1);
	}

	.grid-lines {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.grid-line {
		position: absolute;
		background: rgba(148, 163, 184, 0.3);
	}

	.grid-line.vertical {
		width: 1px;
		height: 100%;
	}

	.grid-line.horizontal {
		width: 100%;
		height: 1px;
	}

	.grid-line.center {
		background: rgba(100, 116, 139, 0.6);
		z-index: 1;
		width: 2px;
	}

	.grid-line.horizontal.center {
		height: 2px;
		width: 100%;
	}

	.quadrant-label {
		position: absolute;
		transform: translate(-50%, -50%);
		padding: var(--space-4) var(--space-5);
		border-radius: var(--radius-lg);
		text-align: center;
		pointer-events: none;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(8px);
		min-width: 160px;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.quadrant-name {
		font-weight: 700;
		font-size: var(--font-size-base);
		margin-bottom: var(--space-2);
		letter-spacing: -0.025em;
	}

	.quadrant-description {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		line-height: 1.4;
		font-weight: 500;
	}

	.feature-dot {
		position: absolute;
		width: 40px;
		height: 40px;
		border-radius: 50%;
		transform: translate(-50%, -50%);
		cursor: grab;
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
		border: 3px solid white;
		z-index: 10;
		transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.feature-dot::before {
		content: '';
		position: absolute;
		inset: -2px;
		background: inherit;
		border-radius: 50%;
		z-index: -1;
		opacity: 0.2;
		transform: scale(0);
		transition: transform 0.2s ease;
	}

	.feature-dot:hover {
		transform: translate(-50%, -50%) scale(1.15);
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		z-index: 20;
	}

	.feature-dot:hover::before {
		transform: scale(1.5);
	}

	.feature-dot.dragging {
		cursor: grabbing;
		transform: translate(-50%, -50%) scale(1.2);
		box-shadow:
			0 25px 50px -12px rgba(0, 0, 0, 0.25),
			0 20px 25px -5px rgba(0, 0, 0, 0.1);
		z-index: 30;
	}

	.feature-info {
		display: none;
		position: absolute;
		bottom: 130%;
		left: 50%;
		transform: translateX(-50%);
		background: rgba(17, 24, 39, 0.95);
		color: white;
		padding: var(--space-3) var(--space-4);
		border-radius: var(--radius-lg);
		font-size: var(--font-size-sm);
		white-space: nowrap;
		z-index: 100;
		pointer-events: none;
		backdrop-filter: blur(8px);
		box-shadow:
			0 20px 25px -5px rgba(0, 0, 0, 0.1),
			0 10px 10px -5px rgba(0, 0, 0, 0.04);
		border: 1px solid rgba(255, 255, 255, 0.1);
	}

	.feature-info::after {
		content: '';
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 6px solid transparent;
		border-top-color: rgba(17, 24, 39, 0.95);
	}

	.feature-dot:hover .feature-info {
		display: block;
		animation: fadeInUp 0.2s ease-out;
	}

	@keyframes fadeInUp {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.feature-title {
		font-weight: 600;
		margin-bottom: var(--space-1);
		color: white;
	}

	.feature-priority {
		font-size: var(--font-size-xs);
		opacity: 0.7;
		text-transform: capitalize;
		font-weight: 500;
	}

	.matrix-legend {
		background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
		border: 1px solid var(--gray-200);
		border-radius: var(--radius-2xl);
		padding: var(--space-8);
		box-shadow:
			0 4px 6px -1px rgba(0, 0, 0, 0.1),
			0 2px 4px -1px rgba(0, 0, 0, 0.06);
	}

	.matrix-legend h4 {
		margin: 0 0 var(--space-6) 0;
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text);
		text-align: center;
		letter-spacing: -0.025em;
	}

	.legend-items {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: var(--space-4);
	}

	.legend-item {
		display: flex;
		align-items: flex-start;
		gap: var(--space-4);
		padding: var(--space-4);
		border-radius: var(--radius-lg);
		background: white;
		border: 1px solid var(--gray-100);
		transition: all 0.2s ease;
	}

	.legend-item:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
		border-color: var(--gray-200);
	}

	.legend-color {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		flex-shrink: 0;
		box-shadow: 0 2px 4px -1px rgba(0, 0, 0, 0.1);
		margin-top: 2px;
	}

	.legend-text {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.legend-name {
		font-weight: 700;
		color: var(--color-text);
		font-size: var(--font-size-base);
		letter-spacing: -0.025em;
	}

	.legend-desc {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		line-height: 1.5;
		font-weight: 500;
	}

	@media (max-width: 1024px) {
		.matrix-wrapper {
			grid-template-columns: 60px 500px;
			grid-template-rows: 500px 60px;
		}

		.quadrant-label {
			min-width: 120px;
			padding: var(--space-3) var(--space-4);
		}

		.legend-items {
			grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		}
	}

	@media (max-width: 768px) {
		.matrix-container {
			gap: var(--space-6);
		}

		.matrix-wrapper {
			grid-template-columns: 50px 400px;
			grid-template-rows: 400px 50px;
			gap: var(--space-3);
		}

		.axis-label {
			font-size: var(--font-size-xs);
		}

		.quadrant-label {
			padding: var(--space-2) var(--space-3);
			min-width: 100px;
		}

		.quadrant-name {
			font-size: var(--font-size-sm);
		}

		.quadrant-description {
			font-size: var(--font-size-xs);
		}

		.feature-dot {
			width: 32px;
			height: 32px;
		}

		.matrix-legend {
			padding: var(--space-4);
		}

		.legend-items {
			grid-template-columns: 1fr;
			gap: var(--space-3);
		}

		.legend-item {
			padding: var(--space-3);
		}
	}

	@media (max-width: 480px) {
		.matrix-wrapper {
			grid-template-columns: 40px 320px;
			grid-template-rows: 320px 40px;
			gap: var(--space-2);
		}

		.quadrant-label {
			padding: var(--space-2);
			min-width: 80px;
		}

		.feature-dot {
			width: 28px;
			height: 28px;
		}
	}
</style>