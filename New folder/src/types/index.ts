export interface TeamMember {
    id: string;
    name: string;
    role: string;
    email: string;
    projects: string[];  // Array of project IDs
    skills: string[];
  }
  
  export interface Milestone {
    id: string;
    title: string;
    description: string;
    dueDate: Date;
    status: 'pending' | 'inProgress' | 'completed';
    assignedTo: string[];  // Array of team member IDs
  }
  
  export interface Resource {
    id: string;
    name: string;
    type: 'equipment' | 'space' | 'software' | 'other';
    status: 'available' | 'inUse' | 'maintenance';
    assignedTo?: string;  // Project ID if assigned
  }
  
  export interface KPI {
    id: string;
    name: string;
    value: number;
    target: number;
    unit: string;
    category: 'technical' | 'business' | 'team';
    date: Date;
  }
  
  export interface BusinessMetrics {
    targetMarket: string;
    revenueModel: string;
    marketSize: string;
    costEstimate: number;
    expectedRevenue: number;
    breakEvenPoint?: Date;
  }
  
  export interface Project {
    id: string;
    name: string;
    description: string;
    status: 'planning' | 'inProgress' | 'completed';
    startDate: Date;
    endDate: Date;
    team: TeamMember[];
    milestones: Milestone[];
    resources: Resource[];
    kpis: KPI[];
    businessMetrics: BusinessMetrics;
  }
  
  // Additional useful types
  export interface ProjectUpdate {
    id: string;
    date: Date;
    content: string;
    author: string;
    type: 'milestone' | 'general' | 'issue';
  }
  
  export interface TaskStatus {
    total: number;
    completed: number;
    inProgress: number;
    pending: number;
  }
  
  export interface ProjectMetrics {
    progress: number;
    resourceUtilization: number;
    teamPerformance: number;
    kpiAchievement: number;
  }