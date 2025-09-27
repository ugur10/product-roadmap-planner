export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status = 'planning' | 'in_progress' | 'testing' | 'completed' | 'on_hold';
export type Category = 'frontend' | 'backend' | 'infrastructure' | 'design' | 'research' | 'other';

// Impact/Effort scoring (1-5 scale)
export type ImpactScore = 1 | 2 | 3 | 4 | 5;
export type EffortScore = 1 | 2 | 3 | 4 | 5;

// Matrix quadrants for strategic categorization
export type MatrixQuadrant = 'quick_wins' | 'major_projects' | 'fill_ins' | 'money_pit';

export interface MatrixPosition {
	impact: ImpactScore;
	effort: EffortScore;
	x?: number; // Optional custom X position for drag-and-drop
	y?: number; // Optional custom Y position for drag-and-drop
}

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
	// Matrix positioning
	matrix?: MatrixPosition;
}

export interface FilterOptions {
	search: string;
	priority: Priority | 'all';
	status: Status | 'all';
	category: Category | 'all';
}