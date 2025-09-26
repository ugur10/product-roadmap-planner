<div class="page">
	<header class="page-header">
		<h1>Dashboard</h1>
		<p class="text-muted">Manage your product roadmap and feature priorities</p>
	</header>

	<div class="dashboard-grid">
		<div class="card stats-card">
			<h3>Feature Overview</h3>
			<div class="stats-grid">
				<div class="stat">
					<div class="stat-value">0</div>
					<div class="stat-label">Total Features</div>
				</div>
				<div class="stat">
					<div class="stat-value">0</div>
					<div class="stat-label">In Progress</div>
				</div>
				<div class="stat">
					<div class="stat-value">0</div>
					<div class="stat-label">Completed</div>
				</div>
			</div>
		</div>

		<div class="card">
			<h3>Quick Actions</h3>
			<div class="actions">
				<button class="btn btn-primary">Add Feature</button>
				<button class="btn btn-secondary">Import Data</button>
				<button class="btn btn-secondary">Export</button>
			</div>
		</div>

		<div class="card features-card">
			<div class="card-header">
				<h3>Recent Features</h3>
				<button class="btn btn-secondary btn-sm">View All</button>
			</div>
			<div class="empty-state">
				<div class="empty-icon">📋</div>
				<p class="empty-text">No features yet</p>
				<p class="text-muted">Add your first feature to get started</p>
				<button class="btn btn-primary">Add Feature</button>
			</div>
		</div>
	</div>
</div>

<style>
	.page-header {
		margin-bottom: var(--space-8);
	}

	.page-header h1 {
		margin-bottom: var(--space-2);
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-6);
	}

	.card {
		padding: var(--space-6);
	}

	.stats-card .stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
		margin-top: var(--space-4);
	}

	.stat {
		text-align: center;
		padding: var(--space-3);
		background: var(--gray-50);
		border-radius: var(--radius);
	}

	.stat-value {
		font-size: var(--font-size-2xl);
		font-weight: 600;
		color: var(--color-primary);
		margin-bottom: var(--space-2);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-muted);
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-4);
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);
	}

	.card-header h3 {
		margin: 0;
	}

	.features-card {
		grid-column: 1 / -1;
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8) var(--space-4);
	}

	.empty-icon {
		font-size: 3rem;
		margin-bottom: var(--space-4);
		opacity: 0.5;
	}

	.empty-text {
		font-size: var(--font-size-lg);
		font-weight: 500;
		margin-bottom: var(--space-2);
	}

	.empty-state .text-muted {
		margin-bottom: var(--space-6);
	}

	@media (min-width: 768px) {
		.dashboard-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (min-width: 1024px) {
		.dashboard-grid {
			grid-template-columns: repeat(3, 1fr);
		}

		.features-card {
			grid-column: span 2;
		}
	}
</style>