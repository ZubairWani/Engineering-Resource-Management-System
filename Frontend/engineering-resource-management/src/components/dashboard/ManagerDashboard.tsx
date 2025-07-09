import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Project } from '@/lib/types'; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PlusCircle, Loader2, FolderOpen } from 'lucide-react';
import { TeamOverviewTable } from './TeamOverviewTable';
import { UtilizationChart } from '../analytics/UtilizationChart';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AddEngineerForm } from '../engineers/AddEngineerForm';
import { ProjectForm } from '../projects/ProjectForm';
import { AssignmentForm } from '../assignments/AssignmentForm';
import { toast } from 'sonner';
import api from '@/Api/axios';
import { useAuth } from '@/hooks/useAuth';

export interface EngineerWithCapacity extends User {
  currentAllocation: number;
}

export const ManagerDashboard = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // --- State Declarations ---
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [dialogState, setDialogState] = useState<{
    type: 'addEngineer' | 'createProject' | 'assignProject' | null;
    data?: any; 
    isLoading?: boolean;
  }>({ type: null });

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [engineersRes, projectsRes] = await Promise.all([
        api.get("/user/engineers"),
        api.get("/project/manager"),
      ]);

      setUsers(engineersRes.data?.success ? engineersRes.data.engineers || [] : []);
      setProjects(projectsRes.data?.success ? projectsRes.data.data || [] : []);

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const teamData = useMemo<EngineerWithCapacity[]>(() => {
    return users
      .filter((u: User) => u?.role === 'ENGINEER')
      .map((engineer: User) => {
        const currentAllocation = projects.reduce((total, project) => {
          const assignment = project.teamMembers.find(
            (member) => member.member._id === engineer._id
          );
          return total + (assignment ? assignment.allocation : 0);
        }, 0);
        
        return { 
          ...engineer, 
          currentAllocation,
          maxCapacity: engineer?.maxCapacity || 100
        };
      });
  }, [users, projects]); 

  const chartData = useMemo(() => (
    teamData.map(e => ({ 
      name: e?.name?.split(' ')[0] || 'Unknown', 
      utilization: e?.currentAllocation || 0 
    }))
  ), [teamData]);

  // --- Handlers for Mutations ---
  const handleAddEngineer = async (newEngineerData: Omit<User, '_id'>) => {
    setDialogState(prev => ({ ...prev, isLoading: true }));
    try {
      await api.post("/user", { ...newEngineerData, role: 'ENGINEER' });
      toast.success(`${newEngineerData.name} has been added!`);
      setDialogState({ type: null });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add engineer");
    } finally {
      setDialogState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleCreateProject = async (projectData: Omit<Project, '_id' | 'managerId' | 'teamSize'>) => {
    setDialogState(prev => ({ ...prev, isLoading: true }));
    try {
      await api.post("/project", projectData);
      toast.success("Project Added Successfully");
      setDialogState({ type: null });
      fetchData();
      setTimeout(() => navigate('/projects'), 500);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create project");
    } finally {
      setDialogState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleAssignProject = async (assignmentData: { projectId: string; allocationPercentage: number; roleInProject: string; }) => {
    setDialogState(prev => ({ ...prev, isLoading: true }));
    const engineer = dialogState.data;
    try {
      if (!engineer?._id) throw new Error("Engineer not found.");
      const requestBody = {
        engineerId: engineer._id,
        allocationPercentage: assignmentData.allocationPercentage,
        role: assignmentData.roleInProject,
      };
      await api.post(`/project/${assignmentData.projectId}/assign`, requestBody);
      toast.success(`Project assigned to ${engineer.name}.`);
      setDialogState({ type: null });
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign project");
    } finally {
      setDialogState(prev => ({ ...prev, isLoading: false }));
    }
  };

  if (isLoading && !users.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manager Dashboard</h1>
            <p className="text-muted-foreground">Team and project oversight center</p>
          </div>
          <div className="flex gap-2 mt-4 sm:mt-0 flex-wrap">
            <Button 
              onClick={() => setDialogState({ type: 'addEngineer' })} 
              className="flex-1 sm:flex-none min-w-[120px]"
              size="sm"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              <span className="truncate">Add Engineer</span>
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setDialogState({ type: 'createProject' })}
              className="flex-1 sm:flex-none min-w-[120px]"
              size="sm"
            >
              <FolderOpen className="mr-2 h-4 w-4" />
              <span className="truncate">Create Project</span>
            </Button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="min-h-[120px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Total Engineers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl sm:text-4xl font-bold">{teamData.length}</p>
            </CardContent>
          </Card>
          <Card className="min-h-[120px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Active Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl sm:text-4xl font-bold">{projects.filter(p => p.status === 'active').length}</p>
            </CardContent>
          </Card>
          <Card className="min-h-[120px]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm sm:text-base">Fully Booked</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl sm:text-4xl font-bold">{teamData.filter(e => e.currentAllocation >= e.maxCapacity).length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Overview & Utilization Sections */}
        <Card>
          <CardHeader>
            <CardTitle>Team Overview</CardTitle>
            <CardDescription>Current workload and capacity for your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <TeamOverviewTable 
                engineers={teamData} 
                onAssignClick={(engineer) => setDialogState({ type: 'assignProject', data: engineer })} 
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Team Utilization Analytics</CardTitle>
            <CardDescription>Visual workload distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] sm:h-[400px]">
              <UtilizationChart data={chartData} />
            </div>
          </CardContent>
        </Card>

        {/* Dialogs */}
        <Dialog open={!!dialogState.type} onOpenChange={(open) => !open && setDialogState({ type: null })}>
          <DialogContent className="max-w-[95vw] sm:max-w-md md:max-w-lg rounded-lg">
            {dialogState.type === 'addEngineer' && (
              <>
                <DialogHeader>
                  <DialogTitle>Add New Engineer</DialogTitle>
                </DialogHeader>
                <AddEngineerForm onSuccess={handleAddEngineer} isLoading={dialogState.isLoading} />
              </>
            )}
            {dialogState.type === 'createProject' && (
              <>
                <DialogHeader>
                  <DialogTitle>Create New Project</DialogTitle>
                </DialogHeader>
                <ProjectForm onSubmit={handleCreateProject} isLoading={dialogState.isLoading} />
              </>
            )}
            {dialogState.type === 'assignProject' && dialogState.data && (
              <>
                <DialogHeader>
                  <DialogTitle>Assign Project to {dialogState.data.name}</DialogTitle>
                </DialogHeader>
                <AssignmentForm 
                  engineer={dialogState.data} 
                  projects={projects.filter(p => p.status !== 'completed')}
                  onSuccess={handleAssignProject}
                  isLoading={dialogState.isLoading}
                />
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};