import { useState, useEffect, useMemo, useCallback } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { useAuth } from '@/hooks/useAuth';
import { Project } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, PieChart, Briefcase, Calendar, Loader2 } from 'lucide-react';
import api from '@/Api/axios';
import { toast } from 'sonner';

// --- Engineer Dashboard Component ---
export const EngineerDashboard = () => {
  const { user, isAuthenticated } = useAuth();

  // --- State for Live Data ---
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- Data Fetching Logic ---
  const fetchData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    setIsLoading(true);
    try {
      // Fetch all projects assigned to the currently logged-in user
      const response = await api.get('/project/user');
      if (response.data.success) {
        setUserProjects(response.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch user assignments:", error);
      toast.error("Could not load your assignments.");
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- All dashboard stats are derived from the single 'userProjects' state ---
  const dashboardStats = useMemo(() => {
    if (!user) {
      return {
        currentAllocation: 0,
        activeProjects: [],
        upcomingProjects: [],
      };
    }

    const now = new Date();

    // Calculate total allocation by finding the user's assignment in each project
    const currentAllocation = userProjects.reduce((sum, project) => {
      // Only count allocation for projects that are currently active
      if (new Date(project.startDate) <= now && new Date(project.endDate) >= now) {
        const myAssignment = project.teamMembers.find(member => member.member === user._id);
        return sum + (myAssignment ? myAssignment.allocation : 0);
      }
      return sum;
    }, 0);

    // Filter projects into active and upcoming lists
    const activeProjects = userProjects.filter(p => new Date(p.startDate) <= now && new Date(p.endDate) >= now);
    const upcomingProjects = userProjects.filter(p => new Date(p.startDate) > now);

    return { currentAllocation, activeProjects, upcomingProjects };
  }, [userProjects, user]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0]}!`}
        description="Here's a summary of your work and availability."
      />

      {/* --- Stat Cards --- */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Allocation</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.currentAllocation}%</div>
            <p className="text-xs text-muted-foreground">{100 - dashboardStats.currentAllocation}% capacity remaining</p>
            <Progress value={dashboardStats.currentAllocation} className="mt-2 h-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.activeProjects.length}</div>
            <p className="text-xs text-muted-foreground">Projects you are working on now</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Assignments</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.upcomingProjects.length}</div>
            <p className="text-xs text-muted-foreground">Projects starting in the future</p>
          </CardContent>
        </Card>
      </div>

      {/* --- Main Content Area for project lists --- */}
      <Card>
        <CardHeader>
          <CardTitle>Your Assignments</CardTitle>
          <CardDescription>A detailed view of your project commitments.</CardDescription>
        </CardHeader>
        <CardContent>
          {userProjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center border-2 border-dashed rounded-lg p-12">
              <CheckCircle className="h-12 w-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold">You're All Clear!</h3>
              <p className="mt-1 text-sm text-muted-foreground">You have no assignments. Enjoy the peace!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {dashboardStats.activeProjects.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Active Now</h3>
                  <div className="space-y-4">
                    {dashboardStats.activeProjects.map(project => (
                      <ProjectAssignmentCard key={project._id} project={project} userId={user?._id ?? ''} />
                    ))}
                  </div>
                </div>
              )}
              {dashboardStats.upcomingProjects.length > 0 && (
                <div>
                  {dashboardStats.activeProjects.length > 0 && <Separator className="my-6" />}
                  <h3 className="text-lg font-semibold mb-3">Upcoming</h3>
                  <div className="space-y-4">
                    {dashboardStats.upcomingProjects.map(project => (
                      <ProjectAssignmentCard key={project._id} project={project} userId={user?._id ?? ''} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// --- Sub-component to display each assignment card ---
interface ProjectAssignmentCardProps {
  project: Project;
  userId: string;
}

const ProjectAssignmentCard = ({ project, userId }: ProjectAssignmentCardProps) => {
  const myAssignment = project.teamMembers.find(member => member.member === userId);
  
  if (!myAssignment) return null;

  return (
    <div className="p-4 border rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <h4 className="font-semibold">{project.name}</h4>
        <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
      </div>
      <div className="flex-shrink-0 flex flex-col sm:items-end gap-2">
        <Badge variant="outline" className="capitalize">Role: {myAssignment.roleInProject}</Badge>
        <Badge variant="secondary">Allocation: {myAssignment.allocation}%</Badge>
        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
          <Calendar className="h-3 w-3" />
          {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};