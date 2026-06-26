"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Briefcase, MapPin, Edit, Save, X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { industries } from "@/data/industries";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    bio: "",
    industry: "",
    subIndustry: "",
    experience: 0,
    skills: []
  });
  const [newSkill, setNewSkill] = useState("");
  const [selectedIndustry, setSelectedIndustry] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (session?.user) {
        try {
          const response = await fetch("/api/user/profile");
          if (response.ok) {
            const userData = await response.json();
            
            // Parse industry format (e.g., "tech-software-development")
            let parsedIndustry = "";
            let parsedSubIndustry = "";
            
            if (userData.industry) {
              const industryParts = userData.industry.split('-');
              if (industryParts.length >= 2) {
                parsedIndustry = industryParts[0];
                parsedSubIndustry = industryParts.slice(1).join('-').replace(/-/g, ' ');
              }
            }

            setProfile({
              name: userData.name || "",
              email: userData.email || "",
              bio: userData.bio || "",
              industry: parsedIndustry,
              subIndustry: parsedSubIndustry,
              experience: userData.experience || 0,
              skills: userData.skills || []
            });

            // Set selected industry for dropdown
            if (parsedIndustry) {
              setSelectedIndustry(industries.find(ind => ind.id === parsedIndustry));
            }
          } else {
            // Fallback to session data if API fails
            setProfile({
              name: session.user.name || "",
              email: session.user.email || "",
              bio: session.user.bio || "",
              industry: "",
              subIndustry: "",
              experience: session.user.experience || 0,
              skills: session.user.skills || []
            });
          }
        } catch (error) {
          console.error("Error fetching profile data:", error);
          // Fallback to session data
          setProfile({
            name: session.user.name || "",
            email: session.user.email || "",
            bio: session.user.bio || "",
            industry: "",
            subIndustry: "",
            experience: session.user.experience || 0,
            skills: session.user.skills || []
          });
        }
      }
    };

    fetchProfileData();
  }, [session]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Format industry back to the expected format
      const formattedIndustry = profile.industry && profile.subIndustry 
        ? `${profile.industry}-${profile.subIndustry.toLowerCase().replace(/ /g, "-")}`
        : profile.industry;

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...profile,
          industry: formattedIndustry
        }),
      });

      if (response.ok) {
        await update(); // Update the session
        setIsEditing(false);
        toast.success("Profile updated successfully!");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = async () => {
    try {
      const response = await fetch("/api/user/profile");
      if (response.ok) {
        const userData = await response.json();
        
        // Parse industry format
        let parsedIndustry = "";
        let parsedSubIndustry = "";
        
        if (userData.industry) {
          const industryParts = userData.industry.split('-');
          if (industryParts.length >= 2) {
            parsedIndustry = industryParts[0];
            parsedSubIndustry = industryParts.slice(1).join('-').replace(/-/g, ' ');
          }
        }

        setProfile({
          name: userData.name || "",
          email: userData.email || "",
          bio: userData.bio || "",
          industry: parsedIndustry,
          subIndustry: parsedSubIndustry,
          experience: userData.experience || 0,
          skills: userData.skills || []
        });

        if (parsedIndustry) {
          setSelectedIndustry(industries.find(ind => ind.id === parsedIndustry));
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
    setIsEditing(false);
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  const handleIndustryChange = (value) => {
    const industry = industries.find(ind => ind.id === value);
    setSelectedIndustry(industry);
    setProfile(prev => ({
      ...prev,
      industry: value,
      subIndustry: "" // Reset sub-industry when industry changes
    }));
  };

  const getIndustryDisplayName = (industryId) => {
    const industry = industries.find(ind => ind.id === industryId);
    return industry ? industry.name : industryId;
  };

  if (!session) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
            <p className="text-muted-foreground">
              Manage your account settings and profile information.
            </p>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-6">
          {/* Main Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and professional information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Enter your email"
                    type="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Professional Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                  disabled={!isEditing}
                  placeholder="Tell us about your professional background..."
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select
                    value={profile.industry}
                    onValueChange={handleIndustryChange}
                    disabled={!isEditing}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry.id} value={industry.id}>
                          {industry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subIndustry">Specialization</Label>
                  <Select
                    value={profile.subIndustry}
                    onValueChange={(value) => setProfile(prev => ({ ...prev, subIndustry: value }))}
                    disabled={!isEditing || !profile.industry}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select your specialization" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedIndustry?.subIndustries.map((sub) => (
                        <SelectItem key={sub} value={sub}>
                          {sub}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  value={profile.experience}
                  onChange={(e) => setProfile(prev => ({ ...prev, experience: parseInt(e.target.value) || 0 }))}
                  disabled={!isEditing}
                  type="number"
                  min="0"
                  max="50"
                  placeholder="0"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>
              Add or remove skills that best describe your expertise.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a new skill"
                  className="flex-1"
                />
                <Button onClick={addSkill} disabled={!newSkill.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {profile.skills.length === 0 && (
                <p className="text-muted-foreground">No skills added yet.</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Current Profile Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Current Profile Summary</CardTitle>
            <CardDescription>
              Overview of your current profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Name</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.name || "Not provided"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.email || "Not provided"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Industry & Specialization</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.industry && profile.subIndustry 
                      ? `${getIndustryDisplayName(profile.industry)} - ${profile.subIndustry}`
                      : profile.industry 
                        ? getIndustryDisplayName(profile.industry)
                        : "Not specified"
                    }
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Experience</p>
                  <p className="text-sm text-muted-foreground">
                    {profile.experience} {profile.experience === 1 ? 'year' : 'years'} of experience
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Skills</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {profile.skills.length > 0 ? (
                      profile.skills.map((skill, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {skill}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No skills added</p>
                    )}
                  </div>
                </div>
              </div>
              {profile.bio && (
                <>
                  <Separator />
                  <div className="flex items-start gap-3">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Bio</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.bio}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Member since</p>
                  <p className="text-sm text-muted-foreground">
                    {session.user.createdAt ? new Date(session.user.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Account Type</p>
                  <p className="text-sm text-muted-foreground">Standard</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 