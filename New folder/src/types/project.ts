import { TeamMember, Milestone,Resource,KPI,BusinessMetrics } from './index.ts';

interface Project {
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