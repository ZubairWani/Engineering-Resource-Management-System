// import { NavLink, useNavigate } from 'react-router-dom';
// import { Button } from '@/components/ui/button';
// import { useAuth } from '@/hooks/useAuth';
// import { LogOut, Users, Briefcase, LayoutDashboard, User as UserIcon, GanttChartSquare } from 'lucide-react';

// interface SidebarProps {
//   onNavigate?: () => void;
// }

// export const Sidebar = ({ onNavigate }: SidebarProps) => {
//   const { user, dispatch } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     dispatch({ type: 'LOGOUT' });
//     navigate('/login');
//   };

//   const primaryNav = user?.role.toLowerCase() === 'manager'
//     ? { to: '/', label: 'Dashboard', icon: LayoutDashboard } 
//     : { to: '/', label: 'My Assignments', icon: GanttChartSquare };

//   const navItems = [
//     primaryNav,
//     { to: '/profile', label: 'My Profile', icon: UserIcon },
//     ...(user?.role.toLowerCase() === 'manager'
//       ? [
//           { to: '/engineers', label: 'Engineers', icon: Users },
//           { to: '/projects', label: 'Projects', icon: Briefcase },
//         ]
//       : []),
//   ];

//   const handleNavigation = () => {
//     if (onNavigate) {
//       onNavigate();
//     }
//   };

//   return (
//     <aside className="w-full h-full bg-card p-4 flex flex-col border-r">
//       <h1 className="text-2xl font-bold mb-8 px-2 text-primary">Res-Man</h1>
      
//       <nav className="flex-grow space-y-1">
//         {navItems.map((item) => (
//           <NavLink
//             key={item.to}
//             to={item.to}
//             end
//             className={({ isActive }) =>
//               `flex items-center p-2 rounded-md text-sm font-medium transition-colors ${
//                 isActive
//                   ? 'bg-primary text-primary-foreground'
//                   : 'text-muted-foreground hover:bg-muted hover:text-foreground'
//               }`
//             }
//             onClick={handleNavigation}
//           >
//             <item.icon className="h-5 w-5 mr-3" />
//             {item.label}
//           </NavLink>
//         ))}
//       </nav>
      
//       <div className="mt-auto">
//         <div className="p-2 mb-2">
//           <p className="font-semibold text-sm">{user?.name}</p>
//           <p className="text-xs text-muted-foreground">{user?.email}</p>
//         </div>
//         <Button 
//           variant="ghost" 
//           className="w-full justify-start text-muted-foreground hover:text-foreground" 
//           onClick={handleLogout}
//         >
//           <LogOut className="h-5 w-5 mr-3" />
//           Logout
//         </Button>
//       </div>
//     </aside>
//   );
// };










import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Users, Briefcase, LayoutDashboard, User as UserIcon, GanttChartSquare } from 'lucide-react';
import { Avatar, AvatarFallback } from '../ui/avatar'; // Import Avatar for a nice touch

interface SidebarProps {
  onNavigate?: () => void;
}

export const Sidebar = ({ onNavigate }: SidebarProps) => {
  const { user, dispatch } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/login');
  };

  // --- FIX: The role check should be case-insensitive for robustness ---
  const primaryNav = user?.role.toUpperCase() === 'MANAGER'
    ? { to: '/', label: 'Dashboard', icon: LayoutDashboard } 
    : { to: '/', label: 'My Assignments', icon: GanttChartSquare };

  const navItems = [
    primaryNav,
    { to: '/profile', label: 'My Profile', icon: UserIcon },
    ...(user?.role.toUpperCase() === 'MANAGER'
      ? [
          { to: '/engineers', label: 'Engineers', icon: Users },
          { to: '/projects', label: 'Projects', icon: Briefcase },
        ]
      : []),
  ];

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  // Get user's first name for the greeting
  const firstName = user?.name.split(' ')[0] || 'User';

  return (
    <aside className="w-full h-full bg-card p-4 flex flex-col border-r">
      {/* --- THIS IS THE DYNAMIC GREETING SECTION --- */}
      <div className="px-2 mb-8">
        <p className="text-sm text-muted-foreground">Welcome back,</p>
        <h1 className="text-2xl font-bold text-primary truncate">
          {firstName}
        </h1>
      </div>
      {/* ------------------------------------------- */}
      
      <nav className="flex-grow space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end
            className={({ isActive }) =>
              `flex items-center p-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
            onClick={handleNavigation}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.label}
          </NavLink>
        ))}
      </nav>
      
      <div className="mt-auto border-t pt-4">
        {/* We can use the Avatar here as well for consistency */}
        <div className="flex items-center gap-3 p-2 mb-2">
            <Avatar className="h-10 w-10">
                <AvatarFallback>
                    {user?.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>
            <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
        </div>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-muted-foreground hover:text-foreground" 
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Logout
        </Button>
      </div>
    </aside>
  );
};