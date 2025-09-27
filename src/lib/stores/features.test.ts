import { describe, it, expect, beforeEach, vi } from 'vitest';
import { featuresStore } from './features.svelte.js';
import type { Feature } from '../types.js';

describe('Features Store', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
		// Reset the store
		featuresStore.loadFeatures();
	});

	describe('addFeature', () => {
		it('should add a new feature with generated id and timestamps', () => {
			const featureData = {
				title: 'Test Feature',
				description: 'Test Description',
				priority: 'high' as const,
				status: 'planning' as const,
				category: 'frontend' as const,
				estimatedHours: 10,
				assignee: 'John Doe',
				matrix: { impact: 4, effort: 2 }
			};

			const newFeature = featuresStore.addFeature(featureData);

			expect(newFeature.id).toBeDefined();
			expect(newFeature.title).toBe('Test Feature');
			expect(newFeature.createdAt).toBeDefined();
			expect(newFeature.updatedAt).toBeDefined();
			expect(featuresStore.features).toContain(newFeature);
		});

		it('should save feature to localStorage', () => {
			const featureData = {
				title: 'Test Feature',
				description: 'Test Description',
				priority: 'high' as const,
				status: 'planning' as const,
				category: 'frontend' as const,
				estimatedHours: 10,
				matrix: { impact: 4, effort: 2 }
			};

			featuresStore.addFeature(featureData);

			const stored = localStorage.getItem('roadmap-features');
			expect(stored).toBeDefined();
			const parsedFeatures = JSON.parse(stored!);
			expect(parsedFeatures).toHaveLength(1);
			expect(parsedFeatures[0].title).toBe('Test Feature');
		});
	});

	describe('updateFeature', () => {
		it('should update an existing feature', () => {
			const feature = featuresStore.addFeature({
				title: 'Original Title',
				description: 'Original Description',
				priority: 'low' as const,
				status: 'planning' as const,
				category: 'backend' as const,
				estimatedHours: 5,
				matrix: { impact: 2, effort: 3 }
			});

			const updatedFeature = featuresStore.updateFeature(feature.id, {
				title: 'Updated Title',
				priority: 'high' as const,
				estimatedHours: 15
			});

			expect(updatedFeature).toBeDefined();
			expect(updatedFeature!.title).toBe('Updated Title');
			expect(updatedFeature!.priority).toBe('high');
			expect(updatedFeature!.estimatedHours).toBe(15);
			expect(updatedFeature!.description).toBe('Original Description'); // unchanged
		});

		it('should update the updatedAt timestamp', () => {
			const feature = featuresStore.addFeature({
				title: 'Test Feature',
				description: 'Test Description',
				priority: 'medium' as const,
				status: 'planning' as const,
				category: 'frontend' as const,
				estimatedHours: 8,
				matrix: { impact: 3, effort: 3 }
			});

			const originalUpdatedAt = feature.updatedAt;

			// Wait a bit to ensure timestamp difference
			setTimeout(() => {
				const updatedFeature = featuresStore.updateFeature(feature.id, {
					title: 'Updated Title'
				});

				expect(updatedFeature!.updatedAt).not.toBe(originalUpdatedAt);
			}, 10);
		});

		it('should return null for non-existent feature', () => {
			const result = featuresStore.updateFeature('non-existent-id', {
				title: 'Updated Title'
			});

			expect(result).toBeNull();
		});
	});

	describe('deleteFeature', () => {
		it('should delete an existing feature', () => {
			const feature = featuresStore.addFeature({
				title: 'To Delete',
				description: 'This will be deleted',
				priority: 'low' as const,
				status: 'planning' as const,
				category: 'other' as const,
				estimatedHours: 2,
				matrix: { impact: 1, effort: 1 }
			});

			const initialCount = featuresStore.features.length;
			const result = featuresStore.deleteFeature(feature.id);

			expect(result).toBe(true);
			expect(featuresStore.features.length).toBe(initialCount - 1);
			expect(featuresStore.features.find(f => f.id === feature.id)).toBeUndefined();
		});

		it('should return false for non-existent feature', () => {
			const result = featuresStore.deleteFeature('non-existent-id');
			expect(result).toBe(false);
		});
	});

	describe('getFeature', () => {
		it('should return the correct feature by id', () => {
			const feature = featuresStore.addFeature({
				title: 'Findable Feature',
				description: 'Can be found',
				priority: 'medium' as const,
				status: 'in_progress' as const,
				category: 'design' as const,
				estimatedHours: 12,
				matrix: { impact: 3, effort: 4 }
			});

			const found = featuresStore.getFeature(feature.id);
			expect(found).toEqual(feature);
		});

		it('should return null for non-existent feature', () => {
			const found = featuresStore.getFeature('non-existent-id');
			expect(found).toBeNull();
		});
	});

	describe('filtering', () => {
		beforeEach(() => {
			// Add test features
			featuresStore.addFeature({
				title: 'Frontend Feature',
				description: 'React component',
				priority: 'high' as const,
				status: 'in_progress' as const,
				category: 'frontend' as const,
				estimatedHours: 16,
				matrix: { impact: 4, effort: 3 }
			});

			featuresStore.addFeature({
				title: 'Backend API',
				description: 'REST API endpoint',
				priority: 'medium' as const,
				status: 'completed' as const,
				category: 'backend' as const,
				estimatedHours: 20,
				matrix: { impact: 5, effort: 4 }
			});

			featuresStore.addFeature({
				title: 'Database Migration',
				description: 'Schema update',
				priority: 'low' as const,
				status: 'planning' as const,
				category: 'infrastructure' as const,
				estimatedHours: 8,
				matrix: { impact: 2, effort: 2 }
			});
		});

		it('should filter by search term', () => {
			featuresStore.setFilter('search', 'frontend');
			const filtered = featuresStore.filteredFeatures;

			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe('Frontend Feature');
		});

		it('should filter by priority', () => {
			featuresStore.setFilter('priority', 'high');
			const filtered = featuresStore.filteredFeatures;

			expect(filtered).toHaveLength(1);
			expect(filtered[0].priority).toBe('high');
		});

		it('should filter by status', () => {
			featuresStore.setFilter('status', 'completed');
			const filtered = featuresStore.filteredFeatures;

			expect(filtered).toHaveLength(1);
			expect(filtered[0].status).toBe('completed');
		});

		it('should filter by category', () => {
			featuresStore.setFilter('category', 'backend');
			const filtered = featuresStore.filteredFeatures;

			expect(filtered).toHaveLength(1);
			expect(filtered[0].category).toBe('backend');
		});

		it('should combine multiple filters', () => {
			featuresStore.setFilter('category', 'frontend');
			featuresStore.setFilter('priority', 'high');
			const filtered = featuresStore.filteredFeatures;

			expect(filtered).toHaveLength(1);
			expect(filtered[0].title).toBe('Frontend Feature');
		});

		it('should clear all filters', () => {
			featuresStore.setFilter('priority', 'high');
			featuresStore.setFilter('status', 'completed');

			featuresStore.clearFilters();

			expect(featuresStore.filters.priority).toBe('all');
			expect(featuresStore.filters.status).toBe('all');
			expect(featuresStore.filters.search).toBe('');
		});
	});

	describe('stats', () => {
		beforeEach(() => {
			featuresStore.addFeature({
				title: 'Feature 1',
				description: 'In progress',
				priority: 'high' as const,
				status: 'in_progress' as const,
				category: 'frontend' as const,
				estimatedHours: 10,
				matrix: { impact: 4, effort: 3 }
			});

			featuresStore.addFeature({
				title: 'Feature 2',
				description: 'Completed',
				priority: 'medium' as const,
				status: 'completed' as const,
				category: 'backend' as const,
				estimatedHours: 15,
				matrix: { impact: 3, effort: 2 }
			});

			featuresStore.addFeature({
				title: 'Feature 3',
				description: 'Planning',
				priority: 'low' as const,
				status: 'planning' as const,
				category: 'design' as const,
				estimatedHours: 5,
				matrix: { impact: 2, effort: 1 }
			});
		});

		it('should calculate correct statistics', () => {
			const stats = featuresStore.stats;

			expect(stats.total).toBe(3);
			expect(stats.inProgress).toBe(1);
			expect(stats.completed).toBe(1);
			expect(stats.planning).toBe(1);
		});
	});

	describe('localStorage integration', () => {
		it('should load sample data when localStorage is empty', () => {
			localStorage.clear();
			featuresStore.loadFeatures();

			// Should have sample data
			expect(featuresStore.features.length).toBeGreaterThan(0);
		});

		it('should load existing data from localStorage', () => {
			const testFeatures = [{
				id: 'test-1',
				title: 'Stored Feature',
				description: 'From localStorage',
				priority: 'high',
				status: 'planning',
				category: 'frontend',
				estimatedHours: 10,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
				matrix: { impact: 4, effort: 3 }
			}];

			localStorage.setItem('roadmap-features', JSON.stringify(testFeatures));
			featuresStore.loadFeatures();

			expect(featuresStore.features.length).toBe(1);
			expect(featuresStore.features[0].title).toBe('Stored Feature');
		});
	});
});