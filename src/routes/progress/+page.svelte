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
					Project Insights
				</h1>
				<p class="hero-subtitle">
					{analytics().completionRate}% complete • {analytics().statusCounts.in_progress} active • {analytics().completedThisWeek} shipped this week
				</p>
			</div>
			<div class="hero-metrics">
				<div class="hero-metric">
					<div class="metric-value">{analytics().totalFeatures}</div>
					<div class="metric-label">Features</div>
				</div>
				<div class="hero-metric highlight">
					<div class="metric-value">{analytics().completionRate}%</div>
					<div class="metric-label">Done</div>
				</div>
				<div class="hero-metric">
					<div class="metric-value">{analytics().highImpactProgress}%</div>
					<div class="metric-label">High Impact</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Smart Insights -->
	{#if insights().length > 0}
		<section class="insights-section">
			<h2>🎯 Action Items</h2>
			<div class="insights-grid">
				{#each insights() as insight}
					<div class="insight-card {insight.urgency}">
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
				{/each}
			</div>
		</section>
	{/if}

	<!-- Key Metrics -->
	<section class="metrics-overview">
		<div class="metrics-grid">
			<!-- Delivery Pipeline -->
			<div class="metric-card">
				<h3>🚀 Pipeline Status</h3>
				<div class="pipeline-compact">
					{#each Object.entries(analytics().statusCounts) as [status, count]}
						{#if count > 0}
							<div class="pipeline-item">
								<span class="status-emoji">{getStatusEmoji(status as Status)}</span>
								<span class="status-label">{status.replace('_', ' ')}</span>
								<span class="status-count">{count}</span>
							</div>
						{/if}
					{/each}
				</div>
			</div>

			<!-- Team Workload Summary -->
			{#if Object.keys(analytics().teamWorkload).length > 0}
				<div class="metric-card">
					<h3>👥 Team Health</h3>
					<div class="team-summary">
						<div class="team-stat">
							<span class="stat-value">{Object.keys(analytics().teamWorkload).length}</span>
							<span class="stat-label">Team Members</span>
						</div>
						{#if Object.values(analytics().teamWorkload).filter(stats => stats.activeItems > 3).length > 0}
							<div class="team-alert">
								⚠️ {Object.values(analytics().teamWorkload).filter(stats => stats.activeItems > 3).length} overloaded
							</div>
						{:else}
							<div class="team-good">
								✅ Balanced workload
							</div>
						{/if}
					</div>
				</div>
			{/if}

			<!-- High Impact Progress -->
			<div class="metric-card">
				<h3>💎 Business Value</h3>
				<div class="value-progress">
					<div class="progress-ring">
						<svg width="80" height="80" viewBox="0 0 80 80">
							<circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-border)" stroke-width="6" />
							<circle
								cx="40"
								cy="40"
								r="32"
								fill="none"
								stroke="var(--color-primary)"
								stroke-width="6"
								stroke-dasharray="201.06"
								stroke-dashoffset={201.06 - (analytics().highImpactProgress / 100) * 201.06}
								transform="rotate(-90 40 40)"
								class="progress-circle"
							/>
						</svg>
						<div class="progress-text">
							<div class="progress-percent">{analytics().highImpactProgress}%</div>
						</div>
					</div>
					<p class="value-desc">High-impact features delivered</p>
				</div>
			</div>
		</div>
	</section>

	<!-- Activity & Summary -->
	{#if analytics().recentActivity.length > 0}
		<section class="activity-summary">
			<div class="activity-grid">
				<div class="activity-card">
					<h3>📈 Recent Updates</h3>
					<div class="activity-list">
						{#each analytics().recentActivity.slice(0, 3) as feature}
							<div class="activity-item">
								<span class="activity-emoji">{getStatusEmoji(feature.status)}</span>
								<div class="activity-info">
									<span class="activity-title">{feature.title}</span>
									<span class="activity-meta">{getTimeAgo(feature.updatedAt)}</span>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<div class="summary-card">
					<h3>📊 Project Status</h3>
					<div class="status-summary">
						<div class="momentum-indicator">
							<span class="momentum-emoji" style="color: {getMomentumColor(analytics().momentum)}">
								{analytics().momentum === 'strong' ? '🚀' : analytics().momentum === 'steady' ? '⚡' : '🐌'}
							</span>
							<span class="momentum-text">
								{analytics().momentum === 'strong'
									? `Strong momentum - ${analytics().completedThisWeek} shipped this week`
									: analytics().momentum === 'steady'
									? `Steady progress - ${analytics().statusCounts.in_progress} in development`
									: 'Consider reviewing priorities and removing blockers'}
							</span>
						</div>
						{#if analytics().overdueFeatures.length > 0}
							<div class="risk-alert">
								⚠️ {analytics().overdueFeatures.length} features overdue
							</div>
						{/if}
					</div>
				</div>
			</div>
		</section>
	{/if}
</div>

<style>
	.dashboard {
		max-width: 1400px;
		margin: 0 auto;
		padding: var(--space-8) var(--space-4);
		background: var(--color-bg);
		min-height: 100vh;
	}

	/* Hero Banner */
	.hero-banner {
		background: var(--gradient-primary);
		border-radius: var(--radius-2xl);
		padding: var(--space-10);
		margin-bottom: var(--space-12);
		color: white;
		position: relative;
		overflow: hidden;
		box-shadow: var(--shadow-xl);
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
		margin-bottom: var(--space-10);
	}

	.insights-section h2 {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--space-6);
		color: var(--color-text);
	}

	.insights-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: var(--space-5);
	}

	.insight-card {
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--space-6);
		border: 1px solid var(--color-border-subtle);
		box-shadow: var(--shadow-md);
		transition: all var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1);
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
		position: relative;
		overflow: hidden;
	}

	.insight-card::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		width: 4px;
		border-radius: 0 var(--radius) var(--radius) 0;
	}

	.insight-card.high::before {
		background: var(--gradient-danger);
	}
	.insight-card.medium::before {
		background: var(--gradient-warning);
	}
	.insight-card.low::before {
		background: var(--gradient-success);
	}

	.insight-card:hover {
		transform: translateY(-4px);
		box-shadow: var(--shadow-xl);
		border-color: var(--color-border);
	}

	.insight-icon {
		font-size: var(--font-size-2xl);
		flex-shrink: 0;
		width: 48px;
		height: 48px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-full);
		background: var(--gradient-subtle);
	}

	.insight-content h3 {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
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
		font-weight: var(--font-weight-semibold);
		color: var(--color-primary);
		background: var(--color-primary-light);
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-full);
		display: inline-block;
	}

	/* Metrics Overview */
	.metrics-overview {
		margin-bottom: var(--space-10);
	}

	.metrics-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
		gap: var(--space-6);
	}

	.metric-card {
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--space-6);
		border: 1px solid var(--color-border-subtle);
		box-shadow: var(--shadow-md);
		transition: all var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1);
	}

	.metric-card:hover {
		transform: translateY(-3px);
		box-shadow: var(--shadow-lg);
		border-color: var(--color-border);
	}

	.metric-card h3 {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--space-5);
		color: var(--color-text);
	}

	/* Pipeline Compact */
	.pipeline-compact {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.pipeline-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--gradient-subtle);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
	}

	.status-emoji {
		font-size: var(--font-size-lg);
		width: 24px;
		text-align: center;
	}

	.status-label {
		flex: 1;
		text-transform: capitalize;
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
	}

	.status-count {
		background: var(--color-primary);
		color: white;
		padding: var(--space-1) var(--space-2-5);
		border-radius: var(--radius-full);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-semibold);
		min-width: 28px;
		text-align: center;
	}

	/* Team Summary */
	.team-summary {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.team-stat {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--gradient-subtle);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
	}

	.stat-value {
		font-size: var(--font-size-2xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
		line-height: 1;
	}

	.stat-label {
		color: var(--color-text-muted);
		font-weight: var(--font-weight-medium);
	}

	.team-alert {
		padding: var(--space-3);
		background: var(--color-warning-light);
		color: var(--color-warning);
		border-radius: var(--radius-lg);
		font-weight: var(--font-weight-semibold);
		border: 1px solid var(--amber-200);
	}

	.team-good {
		padding: var(--space-3);
		background: var(--color-success-light);
		color: var(--color-success);
		border-radius: var(--radius-lg);
		font-weight: var(--font-weight-semibold);
		border: 1px solid var(--emerald-200);
	}

	/* Value Progress */
	.value-progress {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-4);
	}

	.progress-ring {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.progress-circle {
		transition: stroke-dashoffset var(--duration-700) ease;
	}

	.progress-text {
		position: absolute;
		text-align: center;
	}

	.progress-percent {
		font-size: var(--font-size-xl);
		font-weight: var(--font-weight-bold);
		color: var(--color-primary);
		line-height: 1;
	}

	.value-desc {
		text-align: center;
		color: var(--color-text-muted);
		font-size: var(--font-size-sm);
		font-weight: var(--font-weight-medium);
		margin: 0;
	}

	/* Activity Summary */
	.activity-summary {
		margin-bottom: var(--space-8);
	}

	.activity-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: var(--space-6);
	}

	.activity-card,
	.summary-card {
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--space-6);
		border: 1px solid var(--color-border-subtle);
		box-shadow: var(--shadow-md);
		transition: all var(--duration-300) cubic-bezier(0.4, 0, 0.2, 1);
	}

	.activity-card:hover,
	.summary-card:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-lg);
		border-color: var(--color-border);
	}

	.activity-card h3,
	.summary-card h3 {
		font-size: var(--font-size-lg);
		font-weight: var(--font-weight-bold);
		margin-bottom: var(--space-5);
		color: var(--color-text);
	}

	.activity-list {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.activity-item {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-3);
		background: var(--gradient-subtle);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
	}

	.activity-emoji {
		font-size: var(--font-size-lg);
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-surface);
		border-radius: var(--radius-full);
		border: 1px solid var(--color-border-subtle);
	}

	.activity-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: var(--space-1);
	}

	.activity-title {
		font-weight: var(--font-weight-semibold);
		color: var(--color-text);
		font-size: var(--font-size-sm);
	}

	.activity-meta {
		font-size: var(--font-size-xs);
		color: var(--color-text-muted);
	}

	.status-summary {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.momentum-indicator {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-4);
		background: var(--gradient-subtle);
		border-radius: var(--radius-lg);
		border: 1px solid var(--color-border-subtle);
	}

	.momentum-emoji {
		font-size: var(--font-size-xl);
	}

	.momentum-text {
		color: var(--color-text);
		font-weight: var(--font-weight-medium);
		line-height: 1.4;
	}

	.risk-alert {
		padding: var(--space-3);
		background: var(--color-danger-light);
		color: var(--color-danger);
		border-radius: var(--radius-lg);
		font-weight: var(--font-weight-semibold);
		border: 1px solid var(--rose-200);
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
