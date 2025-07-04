import { EngineerWithCapacity, User } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CapacityBar } from '../common/CapacityBar';
import { SkillTag } from '../common/SkillTag';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar'; 

interface TeamOverviewTableProps {
  engineers: EngineerWithCapacity[];
  onAssignClick: (engineer: User) => void;
}

export const TeamOverviewTable = ({ engineers, onAssignClick }: TeamOverviewTableProps) => {
  if (!engineers || engineers.length === 0) {
    return <p className="text-center text-muted-foreground p-8">No engineers found.</p>;
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">Name</TableHead>
          <TableHead>Skills</TableHead>
          <TableHead className="w-[200px]">Capacity</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {engineers.map((engineer) => (
          <TableRow key={engineer._id}>
            <TableCell className="font-medium">
              
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback>
                    {engineer.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <span>{engineer.name}</span>
                  <p className="text-xs text-muted-foreground">{engineer.seniority}</p>
                </div>
              </div>
           
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-1">
                
                {engineer.skills.length === 0? "NA": engineer.skills.slice(0, 4).map(skill => <SkillTag key={skill} skill={skill} />)}
              </div>
            </TableCell>
            <TableCell>
              <CapacityBar allocation={engineer.currentAllocation} maxCapacity={engineer.maxCapacity} />
            </TableCell>
            <TableCell className="text-right">
              <Button size="sm" variant="outline" onClick={() => onAssignClick(engineer)}>
                Assign Project
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};