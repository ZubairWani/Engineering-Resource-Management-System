// // As defined in the project description
// export interface User {
//   _id: string;
//   email: string;
//   name: string;
//   role: 'engineer' | 'manager';
//   skills: string[];
//   seniority: 'junior' | 'mid' | 'senior';
//   maxCapacity: 50 | 100; // 50 for part-time, 100 for full-time
//   department?: string;
// }

// export interface Project {
//   _id: string;
//   name: string;
//   description: string;
//   startDate: string; 
//   endDate: string;
//   requiredSkills: string[]; // This is important
//   teamSize: number;
//   status: 'planning' | 'active' | 'completed';
//   managerId: string;
// }

// export interface Assignment {
//   _id: string;
//   engineerId: string;
//   projectId: string;
//   allocationPercentage: number;
//   startDate: string;
//   endDate: string;
//   role: 'Developer' | 'Tech Lead' | 'QA'; // Example project roles
// }

// // For API responses, etc.
// export interface EngineerWithCapacity extends User {
//   currentAllocation: number;
//   availableCapacity: number;
// }

// export interface PopulatedAssignment extends Assignment {
//   project: Project;
//   engineer: User;
// }












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