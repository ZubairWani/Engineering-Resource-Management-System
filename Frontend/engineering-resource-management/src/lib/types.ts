// src/lib/types.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'ENGINEER' | 'MANAGER';
  seniority: 'junior' | 'mid' | 'senior';
  skills: string[];
  maxCapacity: 50 | 100;
  department?: string;
}

export interface Project {
  _id: string;
  name: string;
  description: string;
  startDate: string; 
  endDate: string;
  requiredSkills: string[];
  status: 'planning' | 'active' | 'completed';
  teamSize: number;
  managerId: string;
  teamMembers: User[];
}

export interface Assignment {
  _id:string;
  engineerId: string;
  projectId: string;
  allocationPercentage: number;
  role: string;
  startDate: string;
  endDate: string;
}

export interface EngineerWithCapacity extends User {
  currentAllocation: number;
}


export interface PopulatedAssignment extends Omit<Assignment, 'projectId'> {
  project: Project | null; 
}

export type ProjectFormData = {
  name: string;
  description: string;
  requiredSkills: string; 
  status: 'planning' | 'active' | 'completed';
  startDate: string; 
  endDate: string;
};

export type AssignmentFormData = {
  engineerId?: string;
  projectId?: string;
  allocationPercentage: number;
  role: string;
};

export type AddEngineerFormData = {
    name: string;
    email: string;
    seniority: 'junior' | 'mid' | 'senior';
    employmentType: 'full-time' | 'part-time';
    skills: string;
};