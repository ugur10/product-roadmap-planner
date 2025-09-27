import type { Feature, FilterOptions } from '../types.js';

function createFeaturesStore() {
	let features = $state<Feature[]>([]);
	let filters = $state<FilterOptions>({
		search: '',
		priority: 'all',
		status: 'all',
		category: 'all'
	});

	// Sample data for demo purposes
	const sampleFeatures: Feature[] = [
		{
			id: '1',
			title: 'User Authentication System',
			description: 'Implement secure login and registration functionality',
			priority: 'high',
			status: 'in_progress',
			category: 'backend',
			estimatedHours: 24,
			assignee: 'John Doe',
			dueDate: '2024-02-15',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '2',
			title: 'Responsive Dashboard Design',
			description: 'Create mobile-friendly dashboard interface',
			priority: 'medium',
			status: 'planning',
			category: 'frontend',
			estimatedHours: 16,
			assignee: 'Jane Smith',
			dueDate: '2024-02-20',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		},
		{
			id: '3',
			title: 'API Performance Optimization',
			description: 'Optimize database queries and API response times',
			priority: 'high',
			status: 'completed',
			category: 'backend',
			estimatedHours: 12,
			assignee: 'Bob Wilson',
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	];

	// Load features from localStorage or use sample data
	function loadFeatures() {
		if (typeof window !== 'undefined') {
			const stored = localStorage.getItem('roadmap-features');
			if (stored) {
				features = JSON.parse(stored);
			} else {
				features = sampleFeatures;
				saveFeatures();
			}
		}
	}

	// Save features to localStorage
	function saveFeatures() {
		if (typeof window !== 'undefined') {
			localStorage.setItem('roadmap-features', JSON.stringify(features));
		}
	}

	// Filtered features based on current filters
	const filteredFeatures = $derived(() => {
		return features.filter(feature => {
			const matchesSearch = filters.search === '' ||
				feature.title.toLowerCase().includes(filters.search.toLowerCase()) ||
				feature.description.toLowerCase().includes(filters.search.toLowerCase());

			const matchesPriority = filters.priority === 'all' || feature.priority === filters.priority;
			const matchesStatus = filters.status === 'all' || feature.status === filters.status;
			const matchesCategory = filters.category === 'all' || feature.category === filters.category;

			return matchesSearch && matchesPriority && matchesStatus && matchesCategory;
		});
	});

	// Statistics
	const stats = $derived(() => {
		const total = features.length;
		const inProgress = features.filter(f => f.status === 'in_progress').length;
		const completed = features.filter(f => f.status === 'completed').length;
		const planning = features.filter(f => f.status === 'planning').length;

		return { total, inProgress, completed, planning };
	});

	// Actions
	function addFeature(featureData: Omit<Feature, 'id' | 'createdAt' | 'updatedAt'>) {
		const newFeature: Feature = {
			...featureData,
			id: crypto.randomUUID(),
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};
		features.push(newFeature);
		saveFeatures();
		return newFeature;
	}

	function updateFeature(id: string, updates: Partial<Omit<Feature, 'id' | 'createdAt'>>) {
		const index = features.findIndex(f => f.id === id);
		if (index !== -1) {
			features[index] = {
				...features[index],
				...updates,
				updatedAt: new Date().toISOString()
			};
			saveFeatures();
			return features[index];
		}
		return null;
	}

	function deleteFeature(id: string) {
		const index = features.findIndex(f => f.id === id);
		if (index !== -1) {
			features.splice(index, 1);
			saveFeatures();
			return true;
		}
		return false;
	}

	function getFeature(id: string) {
		return features.find(f => f.id === id) || null;
	}

	function setFilter<K extends keyof FilterOptions>(key: K, value: FilterOptions[K]) {
		filters[key] = value;
	}

	function clearFilters() {
		filters = {
			search: '',
			priority: 'all',
			status: 'all',
			category: 'all'
		};
	}

	// Initialize
	loadFeatures();

	return {
		get features() { return features; },
		get filteredFeatures() { return filteredFeatures; },
		get filters() { return filters; },
		get stats() { return stats; },
		addFeature,
		updateFeature,
		deleteFeature,
		getFeature,
		setFilter,
		clearFilters,
		loadFeatures,
		saveFeatures
	};
}

export const featuresStore = createFeaturesStore();