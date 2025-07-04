import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { User } from '@/lib/types';
import axios from '@/Api/axios';

const addEngineerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Please enter a valid email address.'),
  seniority: z.enum(['junior', 'mid', 'senior']),
  employmentType: z.enum(['full-time', 'part-time']),
  skills: z.string().min(1, 'Please add at least one skill.'),
});

type AddEngineerFormData = z.infer<typeof addEngineerSchema>;

interface AddEngineerFormProps {
  onSuccess: (data: Omit<User, '_id'>) => void;
}

export const AddEngineerForm = ({ onSuccess }: AddEngineerFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<AddEngineerFormData>({
    resolver: zodResolver(addEngineerSchema),
    defaultValues: { name: '', email: '', seniority: 'junior', employmentType: 'full-time', skills: '' },
  });

  const onSubmit = async (data: AddEngineerFormData) => {
    setIsLoading(true);
    const newEngineerData = {
      name: data.name,
      email: data.email,
      role: 'ENGINEER' as const,
      password: 'password123' as const,
      seniority: data.seniority,
      maxCapacity: data.employmentType === 'full-time' ? 100 : 50,
      skills: data.skills.split(',').map(s => s.trim()).filter(Boolean),
    };
    
    try {
      const response = await axios.post("/auth/register", newEngineerData)
      
      if(response.data.success){
        toast.success("Engineer Added Successfully");
        setTimeout(()=>{
          window.location.reload()
          
        }, 2000);
      }
    } catch (error) {
      toast.error(error.message)
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField name="name" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Jane Doe" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField name="email" control={form.control} render={({ field }) => (
          <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input placeholder="jane.doe@example.com" {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <FormField name="skills" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Skills (comma-separated)</FormLabel><FormControl><Input placeholder="React, Python..." {...field} /></FormControl><FormMessage /></FormItem>
        )}/>
        <div className="grid grid-cols-2 gap-4">
          <FormField name="seniority" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Seniority</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="junior">Junior</SelectItem><SelectItem value="mid">Mid-level</SelectItem><SelectItem value="senior">Senior</SelectItem></SelectContent></Select><FormMessage /></FormItem>
          )}/>
          <FormField name="employmentType" control={form.control} render={({ field }) => (
            <FormItem><FormLabel>Employment</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="full-time">Full-time (100%)</SelectItem><SelectItem value="part-time">Part-time (50%)</SelectItem></SelectContent></Select><FormMessage /></FormItem>
          )}/>
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Add Engineer'}
        </Button>
      </form>
    </Form>
  );
};