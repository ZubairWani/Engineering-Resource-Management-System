import { useState, useMemo, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { User, Project } from "@/lib/types"; 
import { AddEngineerForm } from "@/components/engineers/AddEngineerForm";
import { TeamOverviewTable } from "@/components/dashboard/TeamOverviewTable"; 
import { AssignmentForm } from "@/components/assignments/AssignmentForm";
import { toast } from "sonner";
import api from "@/Api/axios";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, PlusCircle } from "lucide-react";

// This interface is required by the TeamOverviewTable to show capacity
export interface EngineerWithCapacity extends User {
  currentAllocation: number;
}

export default function EngineersPage() {
  const { isAuthenticated } = useAuth();

  // --- State for Live Data ---
  const [engineers, setEngineers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- State for UI Controls ---
  const [searchTerm, setSearchTerm] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [dialogState, setDialogState] = useState<{
    type: 'add' | 'assign' | null;
    data?: User; 
    isLoading?: boolean;
  }>({ type: null });

  // --- Data Fetching Logic ---
  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      // Fetch both engineers and projects in parallel
      const [engineersRes, projectsRes] = await Promise.all([
        api.get('/user/engineers'),
        api.get('/project/manager'), 
      ]);

      setEngineers(engineersRes.data.success ? engineersRes.data.engineers || [] : []);
      setProjects(projectsRes.data.success ? projectsRes.data.data || [] : []);

    } catch (error) {
      console.error("Error fetching page data:", error);
      toast.error("Failed to load page data.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const engineersWithCapacity = useMemo(() => {
    return engineers
      .map((engineer) => {
        // Calculate allocation by iterating through each project's team
        const currentAllocation = projects.reduce((total, project) => {
          const assignment = project.teamMembers.find(
            (member) => member.member._id === engineer._id
          );
          // If the engineer is found, add their allocation from that project
          return total + (assignment ? assignment.allocation : 0);
        }, 0);

        return { ...engineer, currentAllocation } as EngineerWithCapacity;
      })
      .filter((engineer) => { 
        const nameMatch = engineer.name.toLowerCase().includes(searchTerm.toLowerCase());
        const skillMatch = skillFilter ? engineer.skills.some((skill) => skill.toLowerCase().includes(skillFilter.toLowerCase())) : true;
        return nameMatch && skillMatch;
      });
  }, [engineers, projects, searchTerm, skillFilter]); 

  // --- Handlers for API mutations ---
  const handleAddEngineer = async (newEngineerData: Omit<User, '_id'>) => {
    setDialogState(prev => ({...prev, isLoading: true}));
    try {
      await api.post('/user', { ...newEngineerData, role: 'ENGINEER' });
      toast.success(`${newEngineerData.name} has been added!`);
      setDialogState({ type: null });
      fetchData(); // Refresh the page data
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add engineer.");
      setDialogState(prev => ({...prev, isLoading: false}));
    }
  };

  const handleAssignProject = async (assignmentData: any) => {
    const engineer = dialogState.data;
    if (!engineer) return;
    setDialogState(prev => ({...prev, isLoading: true}));

    try {
      const requestBody = {
        engineerId: engineer._id,
        allocationPercentage: assignmentData.allocationPercentage,
        role: assignmentData.roleInProject,
      };
      await api.post(`/project/${assignmentData.projectId}/assign`, requestBody);
      toast.success(`Project assigned to ${engineer.name}!`);
      setDialogState({ type: null });
      fetchData(); // Refresh the page data to update capacity bars
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to assign project.");
      setDialogState(prev => ({...prev, isLoading: false}));
    }
  };
  
  // --- Memoized list of projects available for assignment ---
  const availableProjects = useMemo(() => {
    const selectedEngineer = dialogState.data;
    if (!selectedEngineer) return [];
    
    // Get a set of project IDs the engineer is already on
    const assignedProjectIds = new Set(
      projects
        .filter(p => p.teamMembers.some(tm => tm.member._id === selectedEngineer._id))
        .map(p => p._id)
    );

    // Return projects that are not completed and not already assigned to this engineer
    return projects.filter(p => p.status !== 'completed' && !assignedProjectIds.has(p._id));
  }, [projects, dialogState.data]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Engineers"
        description="Find, manage, and assign engineers on your team."
        actions={
          <Button onClick={() => setDialogState({ type: 'add' })}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Engineer
          </Button>
        }
      />

      <div className="grid sm:grid-cols-2 gap-4">
        <Input placeholder="Search by name..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        <Input placeholder="Filter by skill..." value={skillFilter} onChange={(e) => setSkillFilter(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <TeamOverviewTable
            engineers={engineersWithCapacity}
            onAssignClick={(engineer) => setDialogState({ type: 'assign', data: engineer })}
          />
        </CardContent>
      </Card>

      {/* --- Single Dialog component to handle both actions --- */}
      <Dialog open={!!dialogState.type} onOpenChange={(open) => !open && setDialogState({ type: null })}>
        <DialogContent>
          {dialogState.type === 'add' && (
            <>
              <DialogHeader>
                <DialogTitle>Add New Engineer</DialogTitle>
                <DialogDescription>Onboard a new member to your team.</DialogDescription>
              </DialogHeader>
              <AddEngineerForm onSuccess={handleAddEngineer} isLoading={dialogState.isLoading} />
            </>
          )}

          {dialogState.type === 'assign' && dialogState.data && (
            <>
              <DialogHeader>
                <DialogTitle>Assign Project to {dialogState.data.name}</DialogTitle>
                <DialogDescription>Select an available project and set the allocation.</DialogDescription>
              </DialogHeader>
              <AssignmentForm
                engineer={dialogState.data}
                projects={availableProjects} 
                onSuccess={handleAssignProject}
                isLoading={dialogState.isLoading}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}