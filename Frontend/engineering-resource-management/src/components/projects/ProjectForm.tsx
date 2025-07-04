import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Project } from '@/lib/types';
import { useAuth } from '@/hooks/useAuth';

const projectSchema = z.object({
  name: z.string().min(3, 'Project name is required.'),
  description: z.string().min(10, 'Description is required.'),
  requiredSkills: z.string().min(1, 'At least one skill is required.'),
  status: z.enum(['planning', 'active', 'completed']),
  startDate: z.string(),
  endDate: z.string(),
});

type ProjectFormData = z.infer<typeof projectSchema>;

interface ProjectFormProps {

  project?: Project | null; 
  onSubmit: (data: Omit<Project, '_id' | 'managerId' | 'teamSize'>, projectId?: string) => void;
}

export const ProjectForm = ({ project, onSubmit }: ProjectFormProps) => {
  const isEditMode = !!project;

  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
   
    defaultValues: {
      name: project?.name || '',
      description: project?.description || '',
      requiredSkills: project?.requiredSkills.join(', ') || '',
      status: project?.status || 'planning',
      startDate: project ? new Date(project.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      endDate: project ? new Date(project.endDate).toISOString().split('T')[0] : new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    },
  });

  const handleFormSubmit = (data: ProjectFormData) => {
    const finalData = {
      ...data,
      requiredSkills: data.requiredSkills.split(',').map(s => s.trim()).filter(Boolean),
    };
    // If editing, pass the project ID along with the data.
    onSubmit(finalData, project?._id);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Project Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField name="description" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField name="requiredSkills" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Required Skills (comma-separated)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="startDate" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
          <FormField name="endDate" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
          )}/>
        </div>
        <FormField name="status" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl>
              <SelectContent>
                <SelectItem value="planning">Planning</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}/>

        <Button type="submit" className="w-full">
          {isEditMode ? 'Save Changes' : 'Create Project'}
        </Button>
      </form>
    </Form>
  );
};