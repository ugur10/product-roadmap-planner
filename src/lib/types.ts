export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold';
export type Category = 'frontend' | 'backend' | 'infrastructure' | 'design' | 'research' | 'other';

export interface Feature {
	id: string;
	title: string;
	description: string;
	priority: Priority;
	status: Status;
	category: Category;
	estimatedHours: number;
	assignee?: string;
	dueDate?: string;
	createdAt: string;
	updatedAt: string;
}

export interface FilterOptions {
	search: string;
	priority: Priority | 'all';
	status: Status | 'all';
	category: Category | 'all';
}