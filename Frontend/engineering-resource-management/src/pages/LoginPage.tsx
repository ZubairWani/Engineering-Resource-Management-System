// LoginPage.tsx
import { LoginForm } from "@/components/auth/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Users, Shield, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <main className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Main login card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <CardHeader className="text-center pb-8 pt-8">
          {/* Enhanced logo/icon area */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground p-4 rounded-2xl shadow-lg">
                <Users className="h-10 w-10" />
              </div>
              {/* Decorative sparkle */}
              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-400 text-white p-1 rounded-full shadow-lg">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>
          </div>
          
          <CardTitle className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-slate-100 dark:to-slate-300 bg-clip-text text-transparent">
            Welcome Back
          </CardTitle>
          <CardDescription className="text-base mt-3 text-slate-600 dark:text-slate-400">
            Sign in to your account to access your dashboard and manage your projects
          </CardDescription>
        </CardHeader>
        
        <CardContent className="px-8 pb-8">
          <LoginForm />
        </CardContent>
        
        {/* Security badge */}
        <div className="px-8 pb-6">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 py-2 px-4 rounded-lg">
            <Shield className="h-3 w-3" />
            <span>Secured with enterprise-grade encryption</span>
          </div>
        </div>
      </Card>

      {/* Floating elements for visual interest */}
      <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400/30 rounded-full animate-bounce delay-300"></div>
      <div className="absolute top-40 right-32 w-1 h-1 bg-purple-400/40 rounded-full animate-bounce delay-700"></div>
      <div className="absolute bottom-32 left-16 w-3 h-3 bg-indigo-400/25 rounded-full animate-bounce delay-1000"></div>
      <div className="absolute bottom-20 right-20 w-2 h-2 bg-pink-400/30 rounded-full animate-bounce delay-500"></div>
    </main>
  );
};

export default LoginPage;