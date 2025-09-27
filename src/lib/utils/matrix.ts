import type { Feature, MatrixQuadrant, ImpactScore, EffortScore, MatrixPosition } from '../types.js';

/**
 * Calculate automated priority score based on Impact × Effort matrix
 * Returns a value between 1-25 where higher is better priority
 */
export function calculatePriorityScore(impact: ImpactScore, effort: EffortScore): number {
	// Higher impact = better, Lower effort = better
	// Formula: (Impact * 5) - (Effort - 1)
	// This gives: Impact 5, Effort 1 = 25 (highest)
	//            Impact 1, Effort 5 = 1 (lowest)
	return (impact * 5) - (effort - 1);
}

/**
 * Determine which quadrant a feature belongs to based on Impact/Effort scores
 */
export function getMatrixQuadrant(impact: ImpactScore, effort: EffortScore): MatrixQuadrant {
	const highImpact = impact >= 4;
	const lowEffort = effort <= 2;

	if (highImpact && lowEffort) {
		return 'quick_wins'; // High Impact, Low Effort
	} else if (highImpact && !lowEffort) {
		return 'major_projects'; // High Impact, High Effort
	} else if (!highImpact && lowEffort) {
		return 'fill_ins'; // Low Impact, Low Effort
	} else {
		return 'money_pit'; // Low Impact, High Effort
	}
}

/**
 * Get human-readable quadrant name
 */
export function getQuadrantName(quadrant: MatrixQuadrant): string {
	switch (quadrant) {
		case 'quick_wins':
			return 'Quick Wins';
		case 'major_projects':
			return 'Major Projects';
		case 'fill_ins':
			return 'Fill-ins';
		case 'money_pit':
			return 'Money Pit';
	}
}

/**
 * Get quadrant description
 */
export function getQuadrantDescription(quadrant: MatrixQuadrant): string {
	switch (quadrant) {
		case 'quick_wins':
			return 'High impact, low effort - Do these first!';
		case 'major_projects':
			return 'High impact, high effort - Plan carefully';
		case 'fill_ins':
			return 'Low impact, low effort - Fill spare time';
		case 'money_pit':
			return 'Low impact, high effort - Avoid if possible';
	}
}

/**
 * Get quadrant color for styling
 */
export function getQuadrantColor(quadrant: MatrixQuadrant): string {
	switch (quadrant) {
		case 'quick_wins':
			return '#10b981'; // Green
		case 'major_projects':
			return '#3b82f6'; // Blue
		case 'fill_ins':
			return '#f59e0b'; // Yellow
		case 'money_pit':
			return '#ef4444'; // Red
	}
}

/**
 * Convert Impact/Effort scores to matrix coordinates (0-100 scale)
 */
export function scoresToCoordinates(impact: ImpactScore, effort: EffortScore): { x: number; y: number } {
	// Impact = Y axis (bottom to top, so we invert)
	// Effort = X axis (left to right)
	return {
		x: ((effort - 1) / 4) * 100, // 1-5 scale to 0-100
		y: ((5 - impact) / 4) * 100  // 1-5 scale to 0-100 (inverted for impact)
	};
}

/**
 * Convert matrix coordinates back to Impact/Effort scores
 */
export function coordinatesToScores(x: number, y: number): { impact: ImpactScore; effort: EffortScore } {
	// Clamp coordinates to 0-100 range
	const clampedX = Math.max(0, Math.min(100, x));
	const clampedY = Math.max(0, Math.min(100, y));

	// Convert back to 1-5 scale
	const effort = Math.round((clampedX / 100) * 4) + 1 as EffortScore;
	const impact = Math.round(((100 - clampedY) / 100) * 4) + 1 as ImpactScore;

	return { impact, effort };
}

/**
 * Update feature's automated priority based on matrix position
 */
export function updateFeaturePriority(feature: Feature): Feature {
	if (!feature.matrix) return feature;

	const score = calculatePriorityScore(feature.matrix.impact, feature.matrix.effort);

	// Map score to priority levels
	let priority: Feature['priority'];
	if (score >= 20) priority = 'critical';
	else if (score >= 15) priority = 'high';
	else if (score >= 10) priority = 'medium';
	else priority = 'low';

	return { ...feature, priority };
}

/**
 * Get default matrix position for new features
 */
export function getDefaultMatrixPosition(): MatrixPosition {
	return {
		impact: 3,
		effort: 3
	};
}