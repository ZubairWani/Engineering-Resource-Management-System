import { EngineerDashboard } from "@/components/dashboard/EngineerDashboard";
import { ManagerDashboard } from "@/components/dashboard/ManagerDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

const DashboardPage = () => {
  const { user } = useAuth();
  
  

  // Show a loading spinner while the user context is being populated
  if (!user) {
    return (
      <div className="flex justify-center items-center h-full pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Render the correct dashboard based on the user's role
  return user.role.toLowerCase() === 'manager' ? <ManagerDashboard /> : <EngineerDashboard />;
};

export default DashboardPage;