// AssignTeamDialog.tsx

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Project, User, Assignment } from "@/lib/types";
import { Avatar, AvatarFallback } from "../ui/avatar";
import AssignmentForm from "../assignments/AssignmentForm"; 

interface AssignTeamDialogProps {
  project: Project;
  engineers: User[]; 
  onAssignmentSuccess: (data: Omit<Assignment, '_id'>) => void;
}

export const AssignTeamDialog = ({ project, engineers, onAssignmentSuccess }: AssignTeamDialogProps) => {
  const currentTeam = project.teamMembers || [];
  

  const assignedEngineerIds = new Set(currentTeam.map(tm => tm.member._id));
  const availableEngineers = engineers.filter(engineer => !assignedEngineerIds.has(engineer._id));

  return (
    <div className="grid gap-6 md:grid-cols-2">
      
      <Card>
        <CardHeader><CardTitle className="text-lg">Current Team</CardTitle></CardHeader>
        <CardContent>
          {currentTeam.length > 0 ? (
            <ul className="space-y-3">
              {currentTeam.map(teamMember => (
                <li key={teamMember.member._id} className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{teamMember.member.name.charAt(0)}</AvatarFallback></Avatar>
                  <div>
                    <span className="font-medium text-sm">{teamMember.member.name}</span>
                    <span className="text-xs text-muted-foreground block">{teamMember.roleInProject} ({teamMember.allocation}%)</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center py-4 text-muted-foreground">No engineers assigned yet.</p>
          )}
        </CardContent>
      </Card>
      
     
      <Card>
        <CardHeader><CardTitle className="text-lg">Add New Member</CardTitle></CardHeader>
        <CardContent>
         
          <AssignmentForm
            project={project}
            engineers={availableEngineers} 
            onSuccess={onAssignmentSuccess} 
          />
        </CardContent>
      </Card>
    </div>
  );
};