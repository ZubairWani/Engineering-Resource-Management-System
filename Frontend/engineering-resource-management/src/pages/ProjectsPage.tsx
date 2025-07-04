import { useEffect, useState, useCallback } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Project, User, Assignment } from "@/lib/types";
import { ProjectForm } from "@/components/projects/ProjectForm";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { AssignTeamDialog } from "@/components/projects/AssignTeamDialog";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { FilePlus2, Loader2 } from "lucide-react";
import api from "@/Api/axios";

export default function ProjectsPage() {
  const { isAuthenticated } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [engineers, setEngineers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [dialogState, setDialogState] = useState<{
    type: "create" | "edit" | "assign" | "delete" | null;
    project: Project | null;
  }>({ type: null, project: null });

  const fetchData = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const [projectsRes, engineersRes] = await Promise.all([
        api.get(`/project/manager`),
        api.get("/user/engineers"),
      ]);

      setProjects(projectsRes.data.success ? projectsRes.data.data || [] : []);
      setEngineers(
        engineersRes.data.success ? engineersRes.data.engineers || [] : []
      );
    } catch (error: any) {
      toast.error("Failed to load page data. Please refresh.");
      console.error("Data fetch error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSaveProject = async (
    projectData: Omit<Project, "_id" | "managerId" | "teamSize">,
    projectId?: string
  ) => {
    try {
      if (dialogState.type === "edit" && projectId) {
        await api.patch(`/project/${projectId}`, projectData);
        toast.success("Project Updated Successfully");
      } else {
        await api.post("/project", projectData);
        toast.success("Project Added Successfully");
      }
      setDialogState({ type: null, project: null });
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save project.");
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await api.delete(`/project/${projectId}`);
      toast.info("Project Deleted Successfully");
      setDialogState({ type: null, project: null });
      await fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to delete project.");
    }
  };

  const handleAssignmentSuccess = async (
    newAssignmentData: Omit<Assignment, "_id">
  ) => {
    try {
      const requestBody = {
        engineerId: newAssignmentData.engineerId,
        allocationPercentage: newAssignmentData.allocationPercentage,
        role: newAssignmentData.roleInProject,
      };

      await api.post(
        `/project/${newAssignmentData.projectId}/assign`,
        requestBody
      );
      toast.success("Engineer assigned successfully!");
      setDialogState({ type: null, project: null });
      await fetchData(); // Refresh the data
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || "Failed to assign engineer."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading projects...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <PageHeader
          title="Projects"
          description="A high-level view of all ongoing and planned initiatives."
          actions={
            <Button
              onClick={() => setDialogState({ type: "create", project: null })}
            >
              Create New Project
            </Button>
          }
        />

        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                onAssignTeam={() => setDialogState({ type: "assign", project })}
                onEdit={() => setDialogState({ type: "edit", project })}
                onDelete={() => setDialogState({ type: "delete", project })}
                teamSize={project.teamMembers.length}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12 mt-8">
            <FilePlus2 className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Projects Found</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Get started by creating a new project.
            </p>
            <Button
              className="mt-4"
              onClick={() => setDialogState({ type: "create", project: null })}
            >
              Create Project
            </Button>
          </div>
        )}
      </div>

      {/* Create/Edit Project Dialog */}
      <Dialog
        open={dialogState.type === "create" || dialogState.type === "edit"}
        onOpenChange={() => setDialogState({ type: null, project: null })}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {dialogState.type === "edit"
                ? "Edit Project"
                : "Create New Project"}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            project={dialogState.project}
            onSubmit={handleSaveProject}
          />
        </DialogContent>
      </Dialog>

      {/* Assign Team Dialog */}
      <Dialog
        open={dialogState.type === "assign"}
        onOpenChange={() => setDialogState({ type: null, project: null })}
      >
        <DialogContent className="max-w-[95vw] w-full mx-2 sm:max-w-3xl">
          <DialogHeader className="px-1 sm:px-0">
            <DialogTitle className="text-lg sm:text-xl">
              Manage Team for: {dialogState.project?.name}
            </DialogTitle>
            <DialogDescription className="text-sm sm:text-base">
              Assign new members and view the current team.
            </DialogDescription>
          </DialogHeader>
          {dialogState.project && (
            <div className="max-h-[75vh] overflow-y-auto px-1 sm:px-0">
              <AssignTeamDialog
                project={dialogState.project}
                engineers={engineers}
                onAssignmentSuccess={handleAssignmentSuccess}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={dialogState.type === "delete"}
        onOpenChange={() => setDialogState({ type: null, project: null })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() =>
                dialogState.project &&
                handleDeleteProject(dialogState.project._id)
              }
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
