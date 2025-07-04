import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar'; 
import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleRouteChange = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [isMobileMenuOpen]);

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Hidden on mobile unless menu is open */}
      <div 
        className={`fixed inset-y-0 left-0 z-50 w-64 transform ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } transition-transform duration-300 ease-in-out md:relative md:translate-x-0 md:w-64`}
      >
        <Sidebar onNavigate={() => setIsMobileMenuOpen(false)} />
      </div>
      
      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <main className="flex-1 p-4 sm:p-6 md:p-8 relative overflow-x-hidden">
        
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden fixed top-4 left-4 z-30 bg-background/80 backdrop-blur-sm"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <Outlet />
      </main>
    </div>
  );
}