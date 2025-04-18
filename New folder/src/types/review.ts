export type ReviewStatus = 'PENDING' | 'IN_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED';
export type ReviewerStatus = 'PENDING' | 'APPROVED' | 'REQUESTED_CHANGES';
export type CommentType = 'TECHNICAL' | 'ADMINISTRATIVE' | 'GENERAL';

export interface Reviewer {
  userId: string;
  name: string;
  role: string;
  status: ReviewerStatus;
  comments: ReviewComment[];
}

export interface ReviewComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  type: CommentType;
  timestamp: Date;
  attachments?: string[];
  parentCommentId?: string;
  status: 'OPEN' | 'RESOLVED';
}

export interface TaskReview {
  taskId: string;
  status: ReviewStatus;
  requiredReviewers: Reviewer[];
  currentReviewLevel: number;
  canPromoteToDone: boolean;
  lastUpdated: Date;
}

export interface ReviewNotification {
  id: string;
  taskId: string;
  userId: string;
  type: 'REVIEW_REQUESTED' | 'CHANGES_REQUESTED' | 'APPROVED' | 'COMMENT_ADDED';
  message: string;
  timestamp: Date;
  read: boolean;
}

// Review level configurations
export const REVIEW_LEVELS = {
  TECHNICIAN: 1,
  SUPERVISOR: 2,
  DEPARTMENT_HEAD: 3
};

// Default reviewers configuration
export const DEFAULT_REVIEWERS = [
  {
    userId: 'prof-baraka',
    name: 'Prof. Baraka Maiseli',
    role: 'Department Head',
    level: REVIEW_LEVELS.DEPARTMENT_HEAD
  },
  {
    userId: 'dr-nassor',
    name: 'Dr. Nassor Ally',
    role: 'Lab Supervisor',
    level: REVIEW_LEVELS.SUPERVISOR
  },
  {
    userId: 'mr-james',
    name: 'Mr. James Micheal',
    role: 'Lab Supervisor',
    level: REVIEW_LEVELS.SUPERVISOR
  },
  {
    userId: 'mr-adrian',
    name: 'Mr. Adrian',
    role: 'Lab Technician',
    level: REVIEW_LEVELS.TECHNICIAN
  }
]; 