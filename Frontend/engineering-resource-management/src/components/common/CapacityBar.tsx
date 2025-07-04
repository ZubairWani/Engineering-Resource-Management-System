import { Progress } from "@/components/ui/progress";
export const CapacityBar = ({ allocation, maxCapacity }: { allocation: number, maxCapacity: number }) => {
    const isOverloaded = allocation > maxCapacity;
    return (
        <div>
            <Progress value={allocation} max={maxCapacity} className="h-2" />
            <p className={`text-xs mt-1 ${isOverloaded ? 'text-destructive' : 'text-muted-foreground'}`}>
                {allocation}% / {maxCapacity}% Allocated
            </p>
        </div>
    );
};