import { Project } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Users, Edit, Trash2 } from "lucide-react";
import { SkillTag } from "../common/SkillTag";

interface ProjectCardProps {
  project: Project;
  onAssignTeam: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: string) => void;
  teamSize: number;
}

export const ProjectCard = ({ project, onAssignTeam, onEdit, onDelete, teamSize }: ProjectCardProps) => {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg pr-2">{project.name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="flex-shrink-0 -mt-2 -mr-2"><MoreHorizontal className="h-5 w-5" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onEdit(project)}><Edit className="mr-2 h-4 w-4" /><span>Edit</span></DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAssignTeam(project)}><Users className="mr-2 h-4 w-4" /><span>Manage Team</span></DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => onDelete(project._id)} className="text-red-600 focus:text-red-600 focus:bg-red-50"><Trash2 className="mr-2 h-4 w-4" /><span>Delete</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription>
          Due: {new Date(project.endDate).toLocaleDateString()}
        </CardDescription>
        <div className="pt-2">
          <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>{project.status.charAt(0).toUpperCase() + project.status.slice(1)}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{project.description}</p>
        <h4 className="font-semibold text-sm mb-2">Required Skills</h4>
        <div className="flex flex-wrap gap-1">
          {project.requiredSkills.map(skill => <SkillTag key={skill} skill={skill} />)}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="flex items-center text-sm w-full">
          <Users className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="font-semibold">{teamSize}</span>
          <span className="text-muted-foreground">members assigned</span>
        </div>
      </CardFooter>
    </Card>
  );
};