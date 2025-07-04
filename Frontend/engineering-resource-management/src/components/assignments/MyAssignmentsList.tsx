import { Assignment, Project } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Percent, Briefcase } from 'lucide-react';
import { mockProjects } from '@/lib/mockData';

interface MyAssignmentsListProps {
  assignments: Assignment[];
  title: string;
}

export const MyAssignmentsList = ({ assignments, title }: MyAssignmentsListProps) => {
  if (assignments.length === 0) {
    return null; 
  }

  const populatedAssignments = assignments.map(assignment => ({
    ...assignment,
    project: mockProjects.find(p => p._id === assignment.projectId) || null,
  }));

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4 tracking-tight">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {populatedAssignments.map((assignment) => (
          assignment.project && (
            <Card key={assignment._id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{assignment.project.name}</CardTitle>
                  <Badge variant={assignment.project.status === 'active' ? 'default' : 'secondary'}>
                    {assignment.project.status.charAt(0).toUpperCase() + assignment.project.status.slice(1)}
                  </Badge>
                </div>
                <CardDescription className="flex items-center pt-1">
                    <Briefcase className="h-4 w-4 mr-2" /> Your Role: {assignment.role}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <span>
                    {new Date(assignment.startDate).toLocaleDateString()} - {new Date(assignment.endDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <Percent className="mr-2 h-4 w-4" />
                  <span>{assignment.allocationPercentage}% of your capacity</span>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </div>
    </section>
  );
};

export default MyAssignmentsList;