import '@testing-library/jest-dom';

// Mock localStorage for tests
Object.defineProperty(window, 'localStorage', {
	value: {
		store: {} as Record<string, string>,
		getItem: function (key: string) {
			return this.store[key] || null;
		},
		setItem: function (key: string, value: string) {
			this.store[key] = value.toString();
		},
		removeItem: function (key: string) {
			delete this.store[key];
		},
		clear: function () {
			this.store = {};
		}
	},
	writable: true
});

// Mock crypto.randomUUID for tests
Object.defineProperty(global, 'crypto', {
	value: {
		randomUUID: () => 'test-uuid-' + Math.random().toString(36).substr(2, 9)
	}
});