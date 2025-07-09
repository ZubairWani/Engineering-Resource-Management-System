import { FormEvent, useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/common/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Project } from "@/lib/types"; 
import {
  Loader2,
  X,
  Mail,
  Briefcase,
  TrendingUp,
  Save,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import api from "@/Api/axios"; 


const ProfilePage = () => {
  const { user, dispatch } = useAuth();

  // State for form data
  const [formData, setFormData] = useState({
    seniority: "",
    employmentType: "",
  });
  const [skills, setSkills] = useState<string[]>([]);

  // State for dynamic data
  const [currentAllocation, setCurrentAllocation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  
  const calculateWorkload = useCallback(async () => {
    if (!user) return;
    try {
      // Use the new endpoint to get only the user's projects
      const response = await api.get("/project/user");
      if (response.data.success) {
        const userProjects: Project[] = response.data.data;

        // Calculate total allocation from the live project data
        const totalAllocation = userProjects.reduce((sum, project) => {
          const myAssignment = project.teamMembers.find(
            (member) => member.member === user._id
          );
          return sum + (myAssignment ? myAssignment.allocation : 0);
        }, 0);
        setCurrentAllocation(totalAllocation);
      }
    } catch (error) {
      console.error(
        "Failed to fetch user projects for workload calculation",
        error
      );
    } finally {
      setIsPageLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // Pre-fill the form with user data
      setFormData({
        seniority: user.seniority || "junior",
        employmentType: user.maxCapacity === 100 ? "full-time" : "part-time",
      });
      setSkills(user.skills || []);
      // Fetch the workload from the API
      calculateWorkload();
    }
  }, [user, calculateWorkload]);

  const handleSelectChange =
    (field: "seniority" | "employmentType") => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

 
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setIsLoading(true);

    try {
      const updatePayload = {
        skills: skills,
        seniority: formData.seniority,
        maxCapacity: formData.employmentType === "full-time" ? 100 : 50,
      };

      // Send a PATCH request to the user update endpoint
      const response = await api.patch(`/user/${user._id}`, updatePayload);

      if (response.data.success) {
        
        dispatch({ type: "SET_USER", payload: { user: response.data.data } });
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isPageLoading || !user) {
    return (
      <div className="flex justify-center items-center h-full pt-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  
  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6">
      <PageHeader
        title="My Profile"
        description="Manage your professional profile and account settings"
      />
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card className="h-full shadow-sm">
            <CardHeader className="text-center pb-4">
              <Avatar className="h-32 w-32 mx-auto mb-6">
                <AvatarFallback className="text-4xl">
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-2xl">{user.name}</CardTitle>
              <CardDescription className="text-lg">{user.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-primary" />
                <p>{user.email}</p>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="h-4 w-4 text-primary" />
                <Badge variant="secondary" className="capitalize">
                  {user.seniority}
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-primary" />
                <p>{user.maxCapacity === 100 ? "Full-time" : "Part-time"}</p>
              </div>
            </CardContent>
            <CardFooter className="pt-6">
              {user.role === "ENGINEER" && (
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-medium text-muted-foreground">
                      Current Workload
                    </Label>
                    <span className="text-sm font-semibold text-foreground">
                      {currentAllocation}% / {user.maxCapacity}%
                    </span>
                  </div>
                  <Progress
                    value={currentAllocation}
                    max={user.maxCapacity}
                    className="w-full h-3 bg-muted"
                  />
                  <p className="text-xs text-muted-foreground text-center">
                    {currentAllocation < user.maxCapacity
                      ? `${
                          user.maxCapacity - currentAllocation
                        }% capacity available`
                      : "At full capacity"}
                  </p>
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
                <CardDescription>
                  Update your professional information.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                {user.role === "ENGINEER" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="seniority">Seniority Level</Label>
                      <Select
                        value={formData.seniority}
                        onValueChange={handleSelectChange("seniority")}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="seniority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="mid">Mid-level</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="employmentType">Employment Type</Label>
                      <Select
                        value={formData.employmentType}
                        onValueChange={handleSelectChange("employmentType")}
                        disabled={isLoading}
                      >
                        <SelectTrigger id="employmentType">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="full-time">
                            Full-time (100%)
                          </SelectItem>
                          <SelectItem value="part-time">
                            Part-time (50%)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
                <Separator />
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Skills & Expertise
                  </h3>
                  <SkillsInput
                    skills={skills}
                    setSkills={setSkills}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Enhanced SkillsInput Sub-Component (No changes needed here) ---
interface SkillsInputProps {
  skills: string[];
  setSkills: React.Dispatch<React.SetStateAction<string[]>>;
  disabled?: boolean;
}
const SkillsInput = ({ skills, setSkills, disabled }: SkillsInputProps) => {
  // ... This component is already well-designed and needs no changes.
  const [inputValue, setInputValue] = useState("");
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const newSkill = inputValue.trim();
      if (newSkill && !skills.includes(newSkill)) {
        setSkills([...skills, newSkill]);
      }
      setInputValue("");
    }
  };
  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };
  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-xl">
        <div className="flex flex-wrap gap-2 mb-3">
          {skills.map((skill) => (
            <Badge key={skill} variant="secondary">
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="ml-2"
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <Input
          id="skills-input"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill and press Enter..."
          className="border-0"
          disabled={disabled}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
