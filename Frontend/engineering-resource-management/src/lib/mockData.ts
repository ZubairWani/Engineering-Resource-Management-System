// src/lib/mockData.ts

import { User, Assignment, Project } from './types';

const today = new Date();
const oneMonthFromNow = new Date(new Date().setMonth(today.getMonth() + 1));
const twoMonthsFromNow = new Date(new Date().setMonth(today.getMonth() + 2));
const oneMonthAgo = new Date(new Date().setMonth(today.getMonth() - 1));

export const mockUsers: { [email: string]: User } = {
  'engineer@mock.com': {
    _id: 'eng123', name: 'Jane Engineer', email: 'engineer@mock.com', role: 'ENGINEER',
    seniority: 'senior', skills: ['TypeScript', 'React', 'GraphQL'], maxCapacity: 100,
  },
  'engineer2@mock.com': { // New part-time engineer
    _id: 'eng456', name: 'Alex Smith', email: 'engineer2@mock.com', role: 'MANAGER',
    seniority: 'mid', skills: ['Python', 'Django', 'SQL'], maxCapacity: 50,
  },
  'manager@mock.com': {
    _id: 'mgr789', name: 'John Manager', email: 'manager@mock.com', role: 'MANAGER',
    seniority: 'senior', skills: ['Agile', 'Project Management', 'Budgeting'], maxCapacity: 100,
  }
};

export const mockProjects: Project[] = [
  { _id: 'p1', name: 'Phoenix Project', description: 'A major new e-commerce platform.', startDate: oneMonthAgo.toISOString(), endDate: twoMonthsFromNow.toISOString(), requiredSkills: ['React', 'Node.js', 'GraphQL'], teamSize: 5, status: 'active', managerId: 'mgr789' },
  { _id: 'p2', name: 'Orion Platform', description: 'Internal tools development using Python.', startDate: today.toISOString(), endDate: oneMonthFromNow.toISOString(), requiredSkills: ['Python', 'SQL'], teamSize: 3, status: 'active', managerId: 'mgr789' },
  { _id: 'p3', name: 'Project Chimera', description: 'Upcoming R&D for a new mobile app.', startDate: oneMonthFromNow.toISOString(), endDate: twoMonthsFromNow.toISOString(), requiredSkills: ['React Native', 'TypeScript'], teamSize: 2, status: 'planning', managerId: 'mgr789' },
];

export const mockAssignmentsDB: Assignment[] = [
  { _id: 'a1', engineerId: 'eng123', projectId: 'p1', allocationPercentage: 60, startDate: oneMonthAgo.toISOString(), endDate: twoMonthsFromNow.toISOString(), role: 'Lead Developer' },
  { _id: 'a2', engineerId: 'eng456', projectId: 'p2', allocationPercentage: 50, startDate: today.toISOString(), endDate: oneMonthFromNow.toISOString(), role: 'Backend Dev' },
  { _id: 'a3', engineerId: 'mgr789', projectId: 'p1', allocationPercentage: 10, startDate: oneMonthAgo.toISOString(), endDate: twoMonthsFromNow.toISOString(), role: 'Project Lead' },
];