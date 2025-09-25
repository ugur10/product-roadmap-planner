<script lang="ts">
</script>

<div class="page">
	<header class="page-header">
		<h1>Dashboard</h1>
		<p class="text-secondary">Manage your product roadmap and feature priorities</p>
	</header>

	<div class="dashboard-grid">
		<div class="card">
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
				<button class="btn btn-primary">Add New Feature</button>
				<button class="btn btn-secondary">Import Data</button>
				<button class="btn btn-secondary">Export Roadmap</button>
			</div>
		</div>

		<div class="card card-full">
			<div class="card-header">
				<h3>Recent Features</h3>
				<button class="btn btn-secondary btn-sm">View All</button>
			</div>
			<div class="empty-state">
				<div class="empty-icon">📋</div>
				<h4>No features yet</h4>
				<p class="text-secondary">Add your first feature to get started with roadmap planning</p>
				<button class="btn btn-primary">Add Feature</button>
			</div>
		</div>

		<div class="card">
			<h3>Roadmap Health</h3>
			<div class="health-metrics">
				<div class="metric">
					<div class="metric-label">Priority Balance</div>
					<div class="metric-bar">
						<div class="metric-fill" style="width: 0%"></div>
					</div>
				</div>
				<div class="metric">
					<div class="metric-label">Resource Allocation</div>
					<div class="metric-bar">
						<div class="metric-fill" style="width: 0%"></div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>

<style lang="scss">
	.page {
		max-width: 1200px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: var(--space-8);

		h1 {
			margin-bottom: var(--space-2);
		}

		p {
			margin: 0;
			font-size: var(--font-size-lg);
		}
	}

	.dashboard-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: var(--space-6);
		margin-bottom: var(--space-8);

		.card-full {
			grid-column: 1 / -1;
		}

		@media (min-width: 768px) {
			grid-template-columns: repeat(2, 1fr);
		}

		@media (min-width: 1024px) {
			grid-template-columns: repeat(3, 1fr);

			.card-full {
				grid-column: span 2;
			}
		}
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
		margin-top: var(--space-4);
	}

	.stat {
		text-align: center;
		padding: var(--space-3);
		border-radius: var(--radius-md);
		background: var(--secondary-50);

		.stat-value {
			font-size: var(--font-size-2xl);
			font-weight: var(--font-weight-bold);
			color: var(--primary-600);
			margin-bottom: var(--space-1);
		}

		.stat-label {
			font-size: var(--font-size-sm);
			color: var(--secondary-600);
		}
	}

	.actions {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		margin-top: var(--space-4);

		.btn {
			justify-content: center;
		}
	}

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--space-4);

		h3 {
			margin: 0;
		}

		.btn-sm {
			padding: var(--space-2) var(--space-3);
			font-size: var(--font-size-xs);
		}
	}

	.empty-state {
		text-align: center;
		padding: var(--space-8) var(--space-4);

		.empty-icon {
			font-size: 3rem;
			margin-bottom: var(--space-4);
			opacity: 0.5;
		}

		h4 {
			margin-bottom: var(--space-2);
			color: var(--secondary-700);
		}

		p {
			margin-bottom: var(--space-6);
		}
	}

	.health-metrics {
		margin-top: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.metric {
		.metric-label {
			font-size: var(--font-size-sm);
			color: var(--secondary-600);
			margin-bottom: var(--space-2);
		}

		.metric-bar {
			height: 8px;
			background: var(--secondary-200);
			border-radius: var(--radius-sm);
			overflow: hidden;

			.metric-fill {
				height: 100%;
				background: linear-gradient(90deg, var(--primary-500), var(--primary-600));
				border-radius: var(--radius-sm);
				transition: width var(--transition-base);
			}
		}
	}
</style>
