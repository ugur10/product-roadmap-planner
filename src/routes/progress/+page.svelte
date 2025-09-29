<script lang="ts">
	import { featuresStore } from '$lib/stores/features.svelte.js';
	import type { Status, Priority } from '$lib/types.js';

	// Derived statistics from the features store
	const { features } = featuresStore;

	// Enhanced PM-focused analytics
	const analytics = $derived(() => {
		const now = new Date();
		const totalFeatures = features.length;

		// Status breakdown
		const statusCounts = {
			planning: features.filter((f) => f.status === 'planning').length,
			in_progress: features.filter((f) => f.status === 'in_progress').length,
			testing: features.filter((f) => f.status === 'testing').length,
			completed: features.filter((f) => f.status === 'completed').length,
			on_hold: features.filter((f) => f.status === 'on_hold').length
		};

		// Risk analysis
		const overdueFeatures = features.filter((f) => {
			if (!f.dueDate || f.status === 'completed') return false;
			return new Date(f.dueDate) < now;
		});

		const criticalInProgress = features.filter(
			(f) => f.priority === 'critical' && f.status === 'in_progress'
		).length;

		const blockedFeatures = features.filter((f) => f.status === 'on_hold');

		// Recent activity (last 7 days)
		const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
		const recentActivity = features
			.filter((f) => new Date(f.updatedAt) > sevenDaysAgo)
			.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
			.slice(0, 5);

		// Velocity & burndown
		const completedThisWeek = features.filter(
			(f) => f.status === 'completed' && new Date(f.updatedAt) > sevenDaysAgo
		).length;

		// Team workload analysis
		const teamWorkload = features.reduce(
			(acc, feature) => {
				if (feature.assignee && feature.status !== 'completed') {
					if (!acc[feature.assignee]) {
						acc[feature.assignee] = {
							activeItems: 0,
							totalHours: 0,
							critical: 0,
							overdue: 0
						};
					}
					acc[feature.assignee].activeItems++;
					acc[feature.assignee].totalHours += feature.estimatedHours;
					if (feature.priority === 'critical') acc[feature.assignee].critical++;
					if (feature.dueDate && new Date(feature.dueDate) < now) acc[feature.assignee].overdue++;
				}
				return acc;
			},
			{} as Record<
				string,
				{ activeItems: number; totalHours: number; critical: number; overdue: number }
			>
		);

		// Business impact analysis
		const highImpactFeatures = features.filter(
			(f) => f.priority === 'critical' || f.priority === 'high'
		);
		const completedHighImpact = highImpactFeatures.filter((f) => f.status === 'completed').length;
		const highImpactProgress =
			highImpactFeatures.length > 0
				? Math.round((completedHighImpact / highImpactFeatures.length) * 100)
				: 0;

		// Completion trends
		const completionRate =
			totalFeatures > 0 ? Math.round((statusCounts.completed / totalFeatures) * 100) : 0;
		const momentum =
			completedThisWeek > 0 ? 'strong' : statusCounts.in_progress > 0 ? 'steady' : 'slow';

		return {
			totalFeatures,
			statusCounts,
			overdueFeatures,
			criticalInProgress,
			blockedFeatures,
			recentActivity,
			completedThisWeek,
			teamWorkload,
			highImpactProgress,
			completionRate,
			momentum
		};
	});

	// Smart insights for PMs
	const insights = $derived(() => {
		const data = analytics();
		const insights = [];

		// Risk alerts
		if (data.overdueFeatures.length > 0) {
			insights.push({
				type: 'risk',
				title: 'Overdue Features',
				message: `${data.overdueFeatures.length} features are past their due date`,
				action: 'Review timeline and reassign resources',
				urgency: 'high'
			});
		}

		if (data.criticalInProgress > 0) {
			insights.push({
				type: 'focus',
				title: 'Critical Features in Progress',
				message: `${data.criticalInProgress} critical features need attention`,
				action: 'Daily check-ins recommended',
				urgency: 'medium'
			});
		}

		if (data.blockedFeatures.length > 0) {
			insights.push({
				type: 'blocker',
				title: 'Blocked Features',
				message: `${data.blockedFeatures.length} features are on hold`,
				action: 'Identify and resolve blockers',
				urgency: 'medium'
			});
		}

		// Positive momentum
		if (data.completedThisWeek > 2) {
			insights.push({
				type: 'success',
				title: 'Strong Momentum',
				message: `${data.completedThisWeek} features completed this week`,
				action: 'Maintain current pace and team morale',
				urgency: 'low'
			});
		}

		// Team capacity
		const overloadedTeamMembers = Object.entries(data.teamWorkload).filter(
			([, stats]) => stats.activeItems > 3
		).length;

		if (overloadedTeamMembers > 0) {
			insights.push({
				type: 'capacity',
				title: 'Team Capacity Concern',
				message: `${overloadedTeamMembers} team members have high workload`,
				action: 'Consider redistributing or deprioritizing features',
				urgency: 'medium'
			});
		}

		return insights;
	});

	function getTimeAgo(dateString: string): string {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
		return `${Math.floor(diffInMinutes / 1440)}d ago`;
	}

	function getMomentumColor(momentum: string): string {
		return momentum === 'strong' ? '#10b981' : momentum === 'steady' ? '#f59e0b' : '#ef4444';
	}

	function getStatusEmoji(status: Status): string {
		const emojis = {
			planning: '📋',
			in_progress: '⚡',
			testing: '🧪',
			completed: '✅',
			on_hold: '⏸️'
		};
		return emojis[status];
	}

	function getPriorityEmoji(priority: Priority): string {
		const emojis = {
			critical: '🔥',
			high: '🟠',
			medium: '🟡',
			low: '🟢'
		};
		return emojis[priority];
	}
</script>

<svelte:head>
	<title>Progress Dashboard - Product Roadmap Planner</title>
	<meta
		name="description"
		content="Smart insights, team performance, and actionable analytics for product managers"
	/>
</svelte:head>

<div class="dashboard">
	<!-- Hero Status Banner -->
	<section class="hero-banner">
		<div class="hero-content">
			<div class="hero-main">
				<h1>
					<span class="momentum-indicator" style="color: {getMomentumColor(analytics().momentum)}">
						{analytics().momentum === 'strong'
							? '🚀'
							: analytics().momentum === 'steady'
								? '⚡'
								: '🐌'}
					</span>
					Project Health Dashboard
				</h1>
				<p class="hero-subtitle">
					{analytics().completionRate}% complete • {analytics().statusCounts.in_progress} in progress
					•
					{analytics().completedThisWeek} shipped this week
				</p>
			</div>
			<div class="hero-metrics">
				<div class="hero-metric">
					<div class="metric-value">{analytics().totalFeatures}</div>
					<div class="metric-label">Total Features</div>
				</div>
				<div class="hero-metric highlight">
					<div class="metric-value">{analytics().completionRate}%</div>
					<div class="metric-label">Complete</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Smart Insights -->
	{#if insights().length > 0}
		<section class="insights-section">
			<h2>🎯 Action Required</h2>
			<div class="insights-grid">
				{#each insights() as insight}
					<div class="insight-card {insight.urgency}">
						<div class="insight-header">
							<div class="insight-icon">
								{#if insight.type === 'risk'}🚨
								{:else if insight.type === 'focus'}👀
								{:else if insight.type === 'blocker'}🚧
								{:else if insight.type === 'success'}🎉
								{:else if insight.type === 'capacity'}⚖️
								{/if}
							</div>
							<div class="insight-content">
								<h3>{insight.title}</h3>
								<p>{insight.message}</p>
								<div class="insight-action">{insight.action}</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Key Progress Areas -->
	<section class="progress-areas">
		<div class="progress-grid">
			<!-- Delivery Pipeline -->
			<div class="area-card pipeline">
				<h3>🚀 Delivery Pipeline</h3>
				<div class="pipeline-flow">
					{#each Object.entries(analytics().statusCounts) as [status, count]}
						{#if count > 0}
							<div class="pipeline-stage">
								<div class="stage-header">
									<span class="stage-emoji">{getStatusEmoji(status as Status)}</span>
									<span class="stage-name">{status.replace('_', ' ')}</span>
									<span class="stage-count">{count}</span>
								</div>
								<div class="stage-bar">
									<div
										class="stage-fill {status}"
										style="width: {(count / analytics().totalFeatures) * 100}%"
									></div>
								</div>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Team Capacity -->
			{#if Object.keys(analytics().teamWorkload).length > 0}
				<div class="area-card capacity">
					<h3>👥 Team Capacity</h3>
					<div class="team-list">
						{#each Object.entries(analytics().teamWorkload) as [member, stats]}
							<div class="team-member" class:overloaded={stats.activeItems > 3}>
								<div class="member-info">
									<div class="member-name">{member}</div>
									<div class="member-stats">
										{stats.activeItems} active • {stats.totalHours}h
										{#if stats.critical > 0}<span class="critical-badge">🔥{stats.critical}</span
											>{/if}
										{#if stats.overdue > 0}<span class="overdue-badge">⏰{stats.overdue}</span>{/if}
									</div>
								</div>
								<div class="capacity-indicator">
									{#if stats.activeItems <= 2}
										<span class="capacity-good">✅</span>
									{:else if stats.activeItems <= 3}
										<span class="capacity-full">⚡</span>
									{:else}
										<span class="capacity-over">🚨</span>
									{/if}
								</div>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- High Impact Progress -->
			<div class="area-card impact">
				<h3>💎 High Impact Features</h3>
				<div class="impact-visual">
					<div class="circular-progress">
						<svg width="120" height="120" viewBox="0 0 120 120">
							<circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="8" />
							<circle
								cx="60"
								cy="60"
								r="50"
								fill="none"
								stroke="#3b82f6"
								stroke-width="8"
								stroke-dasharray="314.16"
								stroke-dashoffset={314.16 - (analytics().highImpactProgress / 100) * 314.16}
								transform="rotate(-90 60 60)"
								class="progress-circle"
							/>
						</svg>
						<div class="progress-text">
							<div class="progress-percent">{analytics().highImpactProgress}%</div>
							<div class="progress-label">Complete</div>
						</div>
					</div>
					<div class="impact-details">
						Critical & high priority features that drive business value
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Recent Activity Feed -->
	{#if analytics().recentActivity.length > 0}
		<section class="activity-section">
			<h2>📈 Recent Activity</h2>
			<div class="activity-feed">
				{#each analytics().recentActivity as feature}
					<div class="activity-item">
						<div class="activity-icon">
							<span class="status-emoji">{getStatusEmoji(feature.status)}</span>
						</div>
						<div class="activity-content">
							<div class="activity-title">
								<span class="feature-title">{feature.title}</span>
								<span class="priority-badge">{getPriorityEmoji(feature.priority)}</span>
							</div>
							<div class="activity-meta">
								{feature.assignee || 'Unassigned'} • {getTimeAgo(feature.updatedAt)} • {feature.status.replace(
									'_',
									' '
								)}
							</div>
						</div>
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Executive Summary -->
	<section class="executive-summary">
		<div class="summary-card">
			<h3>📊 Executive Summary</h3>
			<div class="summary-content">
				<div class="summary-stat">
					<strong>{analytics().completionRate}%</strong> of features completed
				</div>
				<div class="summary-stat">
					<strong>{analytics().statusCounts.in_progress}</strong> features in active development
				</div>
				{#if analytics().overdueFeatures.length > 0}
					<div class="summary-stat risk">
						<strong>{analytics().overdueFeatures.length}</strong> features overdue
					</div>
				{/if}
				<div class="summary-narrative">
					{#if analytics().momentum === 'strong'}
						Team is delivering with strong momentum. {analytics().completedThisWeek} features shipped
						this week.
					{:else if analytics().momentum === 'steady'}
						Steady progress with {analytics().statusCounts.in_progress} features in development.
					{:else}
						Consider reviewing priorities and removing blockers to improve delivery pace.
					{/if}
				</div>
			</div>
		</div>
	</section>
</div>

<style>
	.dashboard {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-6) var(--space-4);
		background: var(--gray-50);
		min-height: 100vh;
	}

	/* Hero Banner */
	.hero-banner {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		border-radius: var(--radius-xl);
		padding: var(--space-8);
		margin-bottom: var(--space-8);
		color: white;
		position: relative;
		overflow: hidden;
	}

	.hero-banner::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="1" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.5" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
		opacity: 0.3;
	}

	.hero-content {
		position: relative;
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: var(--space-8);
	}

	.hero-main h1 {
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 800;
		margin-bottom: var(--space-3);
		line-height: 1.1;
		display: flex;
		align-items: center;
		gap: var(--space-3);
	}

	.momentum-indicator {
		font-size: 0.8em;
	}

	.hero-subtitle {
		font-size: var(--font-size-lg);
		opacity: 0.9;
		font-weight: 500;
	}

	.hero-metrics {
		display: flex;
		gap: var(--space-6);
	}

	.hero-metric {
		text-align: center;
		padding: var(--space-4);
		background: rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-lg);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.2);
	}

	.hero-metric.highlight {
		background: rgba(255, 255, 255, 0.2);
		border: 2px solid rgba(255, 255, 255, 0.3);
	}

	.hero-metric .metric-value {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		line-height: 1;
	}

	.hero-metric .metric-label {
		font-size: var(--font-size-sm);
		opacity: 0.8;
		margin-top: var(--space-1);
	}

	/* Insights Section */
	.insights-section {
		margin-bottom: var(--space-8);
	}

	.insights-section h2 {
		font-size: var(--font-size-xl);
		font-weight: 700;
		margin-bottom: var(--space-4);
		color: var(--color-text);
	}

	.insights-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: var(--space-4);
	}

	.insight-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--space-5);
		border-left: 4px solid;
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}

	.insight-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);
	}

	.insight-card.high {
		border-left-color: #ef4444;
	}
	.insight-card.medium {
		border-left-color: #f59e0b;
	}
	.insight-card.low {
		border-left-color: #10b981;
	}

	.insight-header {
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
	}

	.insight-icon {
		font-size: var(--font-size-xl);
		flex-shrink: 0;
	}

	.insight-content h3 {
		font-size: var(--font-size-lg);
		font-weight: 700;
		margin-bottom: var(--space-2);
		color: var(--color-text);
	}

	.insight-content p {
		color: var(--color-text-muted);
		margin-bottom: var(--space-3);
		line-height: 1.5;
	}

	.insight-action {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-primary);
		background: rgba(59, 130, 246, 0.1);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius);
		display: inline-block;
	}

	/* Progress Areas */
	.progress-areas {
		margin-bottom: var(--space-8);
	}

	.progress-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: var(--space-6);
	}

	.area-card {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
		transition: all 0.2s ease;
	}

	.area-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 8px 25px -8px rgba(0, 0, 0, 0.15);
	}

	.area-card h3 {
		font-size: var(--font-size-lg);
		font-weight: 700;
		margin-bottom: var(--space-5);
		color: var(--color-text);
	}

	/* Pipeline Flow */
	.pipeline-flow {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.pipeline-stage {
		display: flex;
		flex-direction: column;
		gap: var(--space-2);
	}

	.stage-header {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-weight: 600;
	}

	.stage-emoji {
		font-size: var(--font-size-lg);
	}

	.stage-name {
		flex: 1;
		text-transform: capitalize;
		color: var(--color-text);
	}

	.stage-count {
		background: var(--gray-100);
		color: var(--color-text-muted);
		padding: var(--space-1) var(--space-2);
		border-radius: var(--radius);
		font-size: var(--font-size-sm);
		font-weight: 700;
	}

	.stage-bar {
		height: 8px;
		background: var(--gray-200);
		border-radius: 4px;
		overflow: hidden;
	}

	.stage-fill {
		height: 100%;
		border-radius: 4px;
		transition: width 0.3s ease;
	}

	.stage-fill.planning {
		background: #f59e0b;
	}
	.stage-fill.in_progress {
		background: #3b82f6;
	}
	.stage-fill.testing {
		background: #8b5cf6;
	}
	.stage-fill.completed {
		background: #10b981;
	}
	.stage-fill.on_hold {
		background: #6b7280;
	}

	/* Team Capacity */
	.team-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.team-member {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--space-3);
		background: var(--gray-50);
		border-radius: var(--radius);
		transition: all 0.2s ease;
	}

	.team-member.overloaded {
		background: rgba(239, 68, 68, 0.1);
		border: 1px solid rgba(239, 68, 68, 0.2);
	}

	.member-name {
		font-weight: 600;
		color: var(--color-text);
		margin-bottom: var(--space-1);
	}

	.member-stats {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
		display: flex;
		align-items: center;
		gap: var(--space-2);
	}

	.critical-badge,
	.overdue-badge {
		background: rgba(239, 68, 68, 0.1);
		color: #dc2626;
		padding: var(--space-1);
		border-radius: var(--radius);
		font-size: 0.75rem;
		font-weight: 600;
	}

	.capacity-indicator {
		font-size: var(--font-size-lg);
	}

	/* Impact Visual */
	.impact-visual {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.circular-progress {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.progress-circle {
		transition: stroke-dashoffset 0.5s ease;
	}

	.progress-text {
		position: absolute;
		text-align: center;
	}

	.progress-percent {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text);
	}

	.progress-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.impact-details {
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		line-height: 1.5;
	}

	/* Activity Feed */
	.activity-section {
		margin-bottom: var(--space-8);
	}

	.activity-section h2 {
		font-size: var(--font-size-xl);
		font-weight: 700;
		margin-bottom: var(--space-4);
		color: var(--color-text);
	}

	.activity-feed {
		background: white;
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
	}

	.activity-item {
		display: flex;
		gap: var(--space-4);
		padding: var(--space-4) 0;
		border-bottom: 1px solid var(--gray-200);
	}

	.activity-item:last-child {
		border-bottom: none;
	}

	.activity-icon {
		flex-shrink: 0;
		width: 40px;
		height: 40px;
		background: var(--gray-100);
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: var(--font-size-lg);
	}

	.activity-title {
		display: flex;
		align-items: center;
		gap: var(--space-2);
		margin-bottom: var(--space-2);
	}

	.feature-title {
		font-weight: 600;
		color: var(--color-text);
	}

	.priority-badge {
		font-size: var(--font-size-sm);
	}

	.activity-meta {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	/* Executive Summary */
	.executive-summary {
		margin-bottom: var(--space-8);
	}

	.summary-card {
		background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
		border-radius: var(--radius-lg);
		padding: var(--space-6);
		border: 1px solid var(--gray-200);
	}

	.summary-card h3 {
		font-size: var(--font-size-lg);
		font-weight: 700;
		margin-bottom: var(--space-4);
		color: var(--color-text);
	}

	.summary-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: var(--space-4);
		margin-bottom: var(--space-4);
	}

	.summary-stat {
		padding: var(--space-3);
		background: white;
		border-radius: var(--radius);
		text-align: center;
		border: 1px solid var(--gray-200);
	}

	.summary-stat.risk {
		background: rgba(239, 68, 68, 0.1);
		border-color: rgba(239, 68, 68, 0.2);
	}

	.summary-stat strong {
		display: block;
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text);
		margin-bottom: var(--space-1);
	}

	.summary-narrative {
		grid-column: 1 / -1;
		padding: var(--space-4);
		background: white;
		border-radius: var(--radius);
		border: 1px solid var(--gray-200);
		font-style: italic;
		color: var(--color-text-muted);
		line-height: 1.6;
	}

	/* Responsive Design */
	@media (max-width: 1024px) {
		.hero-content {
			flex-direction: column;
			text-align: center;
			gap: var(--space-6);
		}

		.insights-grid {
			grid-template-columns: 1fr;
		}

		.progress-grid {
			grid-template-columns: 1fr;
		}

		.summary-content {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.dashboard {
			padding: var(--space-4) var(--space-2);
		}

		.hero-banner {
			padding: var(--space-6) var(--space-4);
		}

		.hero-main h1 {
			font-size: clamp(1.5rem, 6vw, 2.5rem);
		}

		.hero-metrics {
			flex-direction: row;
			justify-content: center;
		}

		.insights-grid {
			grid-template-columns: 1fr;
		}

		.area-card {
			padding: var(--space-4);
		}
	}
</style>
