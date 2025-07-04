import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User, Project } from '@/lib/types';
import { Loader2 } from 'lucide-react';

const projectRoles = ['developer', 'lead', 'architect', 'qa'] as const;

const assignmentSchema = z.object({
  projectId: z.string().optional(),
  engineerId: z.string().optional(),
  allocationPercentage: z.coerce.number().min(1, "Must be > 0%").max(100, "Must be <= 100%"),
  roleInProject: z.enum(projectRoles, { required_error: 'You must select a role.' }),
}).refine(data => {
    return !!data.engineerId || !!data.projectId;
}, {
    message: "A selection is required.",
});


type AssignmentFormData = z.infer<typeof assignmentSchema>;

interface AssignmentFormProps {
  project?: Project;
  engineer?: User;
  
  projects?: Project[];
  engineers?: User[];
  
  onSuccess: (data: any) => void;
  isLoading?: boolean;
}

export const AssignmentForm = ({ 
  project, 
  engineer, 
  projects = [], 
  engineers = [], 
  onSuccess, 
  isLoading 
}: AssignmentFormProps) => {

  const form = useForm<AssignmentFormData>({
    resolver: zodResolver(assignmentSchema),
    defaultValues: {
      allocationPercentage: 25,
      roleInProject: 'developer',
    },
  });

  const handleFormSubmit = (data: AssignmentFormData) => {
    const finalData = {
      projectId: project?._id || data.projectId,
      engineerId: engineer?._id || data.engineerId,
      allocationPercentage: data.allocationPercentage,
      roleInProject: data.roleInProject,
    };
    onSuccess(finalData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        
        {/* CONTEXT: On a PROJECT page, show a dropdown of ENGINEERS */}
        {!engineer && (
          <FormField name="engineerId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Engineer</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select an engineer" /></SelectTrigger></FormControl>
                <SelectContent>
                  {engineers.length > 0 ? (
                    engineers.map(e => <SelectItem key={e._id} value={e._id}>{e.name}</SelectItem>)
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">No available engineers.</div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}/>
        )}

        {/* CONTEXT: On an ENGINEER page, show a dropdown of PROJECTS */}
        {!project && (
           <FormField name="projectId" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>Project</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger></FormControl>
                <SelectContent>
                  {projects.length > 0 ? (
                    projects.map(p => <SelectItem key={p._id} value={p._id}>{p.name}</SelectItem>)
                  ) : (
                    <div className="p-2 text-sm text-muted-foreground text-center">No available projects.</div>
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}/>
        )}
        
        {/* Allocation Field */}
        <FormField name="allocationPercentage" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Allocation (%)</FormLabel>
            <FormControl><Input type="number" placeholder="e.g., 50" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )}/>

        {/* Role in Project Dropdown */}
        <FormField name="roleInProject" control={form.control} render={({ field }) => (
          <FormItem>
            <FormLabel>Role in Project</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                <SelectContent>
                    {projectRoles.map(role => (
                        <SelectItem key={role} value={role}>
                          
                            {role.charAt(0).toUpperCase() + role.slice(1)}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}/>

        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
        </Button>
      </form>
    </Form>
  );
};

export default AssignmentForm;