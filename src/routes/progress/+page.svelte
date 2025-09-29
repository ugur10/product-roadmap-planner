<script lang="ts">
	import { featuresStore } from '$lib/stores/features.svelte.js';
	import type { Status, Priority, Category } from '$lib/types.js';

	// Derived statistics from the features store
	const { features } = featuresStore;

	// Enhanced analytics calculations
	const analytics = $derived(() => {
		const totalFeatures = features.length;
		const statusCounts = {
			planning: features.filter(f => f.status === 'planning').length,
			in_progress: features.filter(f => f.status === 'in_progress').length,
			testing: features.filter(f => f.status === 'testing').length,
			completed: features.filter(f => f.status === 'completed').length,
			on_hold: features.filter(f => f.status === 'on_hold').length
		};

		const priorityCounts = {
			critical: features.filter(f => f.priority === 'critical').length,
			high: features.filter(f => f.priority === 'high').length,
			medium: features.filter(f => f.priority === 'medium').length,
			low: features.filter(f => f.priority === 'low').length
		};

		const categoryCounts = {
			frontend: features.filter(f => f.category === 'frontend').length,
			backend: features.filter(f => f.category === 'backend').length,
			infrastructure: features.filter(f => f.category === 'infrastructure').length,
			design: features.filter(f => f.category === 'design').length,
			research: features.filter(f => f.category === 'research').length,
			other: features.filter(f => f.category === 'other').length
		};

		// Team performance
		const assigneeStats = features.reduce((acc, feature) => {
			if (feature.assignee) {
				if (!acc[feature.assignee]) {
					acc[feature.assignee] = {
						total: 0,
						completed: 0,
						inProgress: 0,
						totalHours: 0
					};
				}
				acc[feature.assignee].total++;
				acc[feature.assignee].totalHours += feature.estimatedHours;
				if (feature.status === 'completed') {
					acc[feature.assignee].completed++;
				}
				if (feature.status === 'in_progress') {
					acc[feature.assignee].inProgress++;
				}
			}
			return acc;
		}, {} as Record<string, {total: number, completed: number, inProgress: number, totalHours: number}>);

		// Completion rate
		const completionRate = totalFeatures > 0 ? Math.round((statusCounts.completed / totalFeatures) * 100) : 0;

		// Active work rate (in progress + testing)
		const activeWork = statusCounts.in_progress + statusCounts.testing;
		const activeRate = totalFeatures > 0 ? Math.round((activeWork / totalFeatures) * 100) : 0;

		// Total estimated hours
		const totalHours = features.reduce((sum, f) => sum + f.estimatedHours, 0);
		const completedHours = features
			.filter(f => f.status === 'completed')
			.reduce((sum, f) => sum + f.estimatedHours, 0);

		return {
			totalFeatures,
			statusCounts,
			priorityCounts,
			categoryCounts,
			assigneeStats,
			completionRate,
			activeRate,
			totalHours,
			completedHours
		};
	});

	// Helper functions for progress calculations
	function getStatusPercentage(count: number, total: number): number {
		return total > 0 ? Math.round((count / total) * 100) : 0;
	}

	function getStatusColor(status: Status): string {
		const colors = {
			planning: '#f59e0b',
			in_progress: '#3b82f6',
			testing: '#8b5cf6',
			completed: '#10b981',
			on_hold: '#6b7280'
		};
		return colors[status];
	}

	function getPriorityColor(priority: Priority): string {
		const colors = {
			critical: '#dc2626',
			high: '#ea580c',
			medium: '#f59e0b',
			low: '#10b981'
		};
		return colors[priority];
	}

	function getCategoryColor(category: Category): string {
		const colors = {
			frontend: '#3b82f6',
			backend: '#10b981',
			infrastructure: '#8b5cf6',
			design: '#f59e0b',
			research: '#06b6d4',
			other: '#6b7280'
		};
		return colors[category];
	}
</script>

<svelte:head>
	<title>Progress Dashboard - Product Roadmap Planner</title>
	<meta name="description" content="Track progress, monitor team performance, and analyze feature development metrics" />
</svelte:head>

<div class="page">
	<header class="page-header">
		<h1>Progress Dashboard</h1>
		<p class="text-muted">Monitor development progress, team performance, and strategic insights</p>
	</header>

	<div class="dashboard-content">
		<!-- Key Metrics Overview -->
		<section class="metrics-overview">
			<div class="metric-card primary">
				<div class="metric-icon" style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
					</svg>
				</div>
				<div class="metric-content">
					<div class="metric-value">{analytics().totalFeatures}</div>
					<div class="metric-label">Total Features</div>
				</div>
			</div>

			<div class="metric-card success">
				<div class="metric-icon" style="background: linear-gradient(135deg, #10b981 0%, #059669 100%);">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<polyline points="20,6 9,17 4,12"></polyline>
					</svg>
				</div>
				<div class="metric-content">
					<div class="metric-value">{analytics().completionRate}%</div>
					<div class="metric-label">Completion Rate</div>
				</div>
			</div>

			<div class="metric-card warning">
				<div class="metric-icon" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10"></circle>
						<polyline points="12,6 12,12 16,14"></polyline>
					</svg>
				</div>
				<div class="metric-content">
					<div class="metric-value">{analytics().activeRate}%</div>
					<div class="metric-label">Active Work</div>
				</div>
			</div>

			<div class="metric-card info">
				<div class="metric-icon" style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="3"></circle>
						<path d="m8 16 4-4 4 4"></path>
						<path d="m8 8 4 4 4-4"></path>
					</svg>
				</div>
				<div class="metric-content">
					<div class="metric-value">{analytics().totalHours}h</div>
					<div class="metric-label">Total Effort</div>
				</div>
			</div>
		</section>

		<!-- Progress Visualizations -->
		<section class="progress-charts">
			<!-- Status Distribution -->
			<div class="chart-card">
				<h3>Status Distribution</h3>
				<div class="status-chart">
					{#each Object.entries(analytics().statusCounts) as [status, count]}
						{@const percentage = getStatusPercentage(count, analytics().totalFeatures)}
						{@const color = getStatusColor(status as Status)}
						<div class="status-bar">
							<div class="status-info">
								<span class="status-label">{status.replace('_', ' ')}</span>
								<span class="status-count">{count} ({percentage}%)</span>
							</div>
							<div class="progress-bar">
								<div
									class="progress-fill"
									style="width: {percentage}%; background: {color};"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>

			<!-- Priority Breakdown -->
			<div class="chart-card">
				<h3>Priority Breakdown</h3>
				<div class="priority-chart">
					{#each Object.entries(analytics().priorityCounts) as [priority, count]}
						{@const percentage = getStatusPercentage(count, analytics().totalFeatures)}
						{@const color = getPriorityColor(priority as Priority)}
						<div class="priority-item">
							<div class="priority-header">
								<span class="priority-dot" style="background: {color};"></span>
								<span class="priority-label">{priority}</span>
								<span class="priority-count">{count}</span>
							</div>
							<div class="progress-bar">
								<div
									class="progress-fill"
									style="width: {percentage}%; background: {color};"
								></div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Category Analysis -->
		<section class="category-analysis">
			<div class="chart-card wide">
				<h3>Category Distribution</h3>
				<div class="category-grid">
					{#each Object.entries(analytics().categoryCounts) as [category, count]}
						{@const percentage = getStatusPercentage(count, analytics().totalFeatures)}
						{@const color = getCategoryColor(category as Category)}
						<div class="category-item">
							<div class="category-visual">
								<div class="category-circle" style="background: {color};">
									{count}
								</div>
								<div class="category-info">
									<div class="category-name">{category}</div>
									<div class="category-percentage">{percentage}%</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>

		<!-- Team Performance -->
		{#if Object.keys(analytics().assigneeStats).length > 0}
		<section class="team-performance">
			<div class="chart-card wide">
				<h3>Team Performance</h3>
				<div class="team-grid">
					{#each Object.entries(analytics().assigneeStats) as [assignee, stats]}
						{@const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}
						<div class="team-member">
							<div class="member-header">
								<div class="member-name">{assignee}</div>
								<div class="member-stats">
									<span class="stat-item">
										<span class="stat-value">{stats.total}</span>
										<span class="stat-label">Total</span>
									</span>
									<span class="stat-item">
										<span class="stat-value">{stats.completed}</span>
										<span class="stat-label">Completed</span>
									</span>
									<span class="stat-item">
										<span class="stat-value">{stats.totalHours}h</span>
										<span class="stat-label">Hours</span>
									</span>
								</div>
							</div>
							<div class="member-progress">
								<div class="progress-header">
									<span>Completion Rate</span>
									<span>{completionRate}%</span>
								</div>
								<div class="progress-bar">
									<div
										class="progress-fill"
										style="width: {completionRate}%; background: #10b981;"
									></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
		{/if}

		<!-- Project Health Insights -->
		<section class="project-insights">
			<div class="insight-grid">
				<div class="insight-card">
					<div class="insight-header">
						<h4>Project Health</h4>
						<div class="health-indicator {analytics().completionRate > 60 ? 'healthy' : analytics().completionRate > 30 ? 'warning' : 'critical'}">
							{analytics().completionRate > 60 ? 'Healthy' : analytics().completionRate > 30 ? 'On Track' : 'Needs Attention'}
						</div>
					</div>
					<p>
						{#if analytics().completionRate > 60}
							Great progress! The team is on track with strong completion rates.
						{:else if analytics().completionRate > 30}
							Good momentum. Consider optimizing active work to maintain pace.
						{:else}
							Focus needed. Review blockers and prioritize quick wins.
						{/if}
					</p>
				</div>

				<div class="insight-card">
					<div class="insight-header">
						<h4>Effort Analysis</h4>
						<div class="effort-stats">
							{Math.round((analytics().completedHours / analytics().totalHours) * 100)}% Complete
						</div>
					</div>
					<p>
						{analytics().completedHours} of {analytics().totalHours} estimated hours completed.
						{analytics().totalHours - analytics().completedHours} hours remaining.
					</p>
				</div>

				<div class="insight-card">
					<div class="insight-header">
						<h4>Recommendations</h4>
					</div>
					<ul>
						{#if analytics().statusCounts.on_hold > 0}
							<li>Review {analytics().statusCounts.on_hold} features on hold</li>
						{/if}
						{#if analytics().priorityCounts.critical > analytics().statusCounts.completed}
							<li>Focus on {analytics().priorityCounts.critical} critical features</li>
						{/if}
						{#if analytics().activeRate < 20}
							<li>Consider increasing active development capacity</li>
						{/if}
						{#if Object.keys(analytics().assigneeStats).length === 0}
							<li>Assign features to team members for better tracking</li>
						{/if}
					</ul>
				</div>
			</div>
		</section>
	</div>
</div>

<style>
	.page-header {
		margin-bottom: var(--space-8);
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

	.dashboard-content {
		display: flex;
		flex-direction: column;
		gap: var(--space-8);
		max-width: 1400px;
		margin: 0 auto;
		padding: 0 var(--space-4);
	}

	/* Metrics Overview */
	.metrics-overview {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: var(--space-6);
	}

	.metric-card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: var(--space-6);
		display: flex;
		align-items: center;
		gap: var(--space-4);
		box-shadow: var(--shadow);
		transition: all 0.2s ease;
	}

	.metric-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.1);
	}

	.metric-icon {
		width: 48px;
		height: 48px;
		border-radius: var(--radius);
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		flex-shrink: 0;
	}

	.metric-content {
		flex: 1;
	}

	.metric-value {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text);
		line-height: 1;
	}

	.metric-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: 500;
		margin-top: var(--space-2);
	}

	/* Progress Charts */
	.progress-charts {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: var(--space-6);
	}

	.chart-card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: var(--space-6);
		box-shadow: var(--shadow);
	}

	.chart-card.wide {
		grid-column: 1 / -1;
	}

	.chart-card h3 {
		margin: 0 0 var(--space-6) 0;
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text);
	}

	/* Status Chart */
	.status-chart {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.status-bar {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.status-info {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.status-label {
		font-weight: 600;
		color: var(--color-text);
		text-transform: capitalize;
	}

	.status-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	.progress-bar {
		height: 8px;
		background: var(--gray-200);
		border-radius: 4px;
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	/* Priority Chart */
	.priority-chart {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.priority-item {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.priority-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.priority-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	.priority-label {
		flex: 1;
		font-weight: 600;
		color: var(--color-text);
		text-transform: capitalize;
	}

	.priority-count {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		font-weight: 500;
	}

	/* Category Analysis */
	.category-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: var(--space-6);
	}

	.category-item {
		text-align: center;
	}

	.category-visual {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-3);
	}

	.category-circle {
		width: 80px;
		height: 80px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		color: white;
		font-size: var(--font-size-xl);
		font-weight: 700;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.category-info {
		text-align: center;
	}

	.category-name {
		font-weight: 600;
		color: var(--color-text);
		text-transform: capitalize;
	}

	.category-percentage {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		margin-top: var(--space-1);
	}

	/* Team Performance */
	.team-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: var(--space-6);
	}

	.team-member {
		background: var(--gray-50);
		border: 1px solid var(--gray-200);
		border-radius: var(--radius);
		padding: var(--space-4);
	}

	.member-header {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-bottom: var(--space-4);
	}

	.member-name {
		font-weight: 600;
		color: var(--color-text);
		font-size: var(--font-size-lg);
	}

	.member-stats {
		display: flex;
		gap: var(--space-4);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-1);
	}

	.stat-value {
		font-weight: 700;
		color: var(--color-text);
		font-size: var(--font-size-lg);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.member-progress {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: var(--font-size-sm);
		font-weight: 500;
	}

	/* Project Insights */
	.insight-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: var(--space-6);
	}

	.insight-card {
		background: white;
		border: 1px solid var(--color-border);
		border-radius: var(--radius);
		padding: var(--space-6);
		box-shadow: var(--shadow);
	}

	.insight-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.insight-header h4 {
		margin: 0;
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-text);
	}

	.health-indicator {
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius);
		font-size: var(--font-size-sm);
		font-weight: 600;
	}

	.health-indicator.healthy {
		background: rgba(16, 185, 129, 0.1);
		color: #059669;
	}

	.health-indicator.warning {
		background: rgba(245, 158, 11, 0.1);
		color: #d97706;
	}

	.health-indicator.critical {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
	}

	.effort-stats {
		font-weight: 600;
		color: var(--color-primary);
	}

	.insight-card p {
		color: var(--color-text-muted);
		line-height: 1.6;
		margin: 0;
	}

	.insight-card ul {
		margin: 0;
		padding-left: var(--space-5);
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	.insight-card li {
		margin-bottom: var(--space-2);
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.dashboard-content {
			padding: 0 var(--space-3);
			gap: var(--space-6);
		}

		.metrics-overview {
			grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
			gap: var(--space-4);
		}

		.progress-charts {
			grid-template-columns: 1fr;
			gap: var(--space-6);
		}

		.category-grid {
			grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
			gap: var(--space-4);
		}

		.team-grid {
			grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
			gap: var(--space-4);
		}
	}

	@media (max-width: 768px) {
		.page-header h1 {
			font-size: clamp(2rem, 6vw, 3rem);
		}

		.page-header .text-muted {
			font-size: var(--font-size-lg);
		}

		.dashboard-content {
			padding: 0 var(--space-2);
			gap: var(--space-5);
		}

		.metrics-overview {
			grid-template-columns: 1fr;
			gap: var(--space-3);
		}

		.metric-card {
			padding: var(--space-4);
			gap: var(--space-3);
		}

		.metric-icon {
			width: 40px;
			height: 40px;
		}

		.category-grid {
			grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
			gap: var(--space-3);
		}

		.category-circle {
			width: 60px;
			height: 60px;
			font-size: var(--font-size-lg);
		}

		.team-grid {
			grid-template-columns: 1fr;
			gap: var(--space-4);
		}

		.insight-grid {
			grid-template-columns: 1fr;
			gap: var(--space-4);
		}
	}
</style>