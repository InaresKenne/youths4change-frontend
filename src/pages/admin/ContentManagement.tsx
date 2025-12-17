import { useState, useEffect } from 'react';
import { adminSettingsService } from '@/services/adminSettingsService';
import type { SiteSettings, PageContent, CoreValue, TeamRole } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Save, 
  Loader2, 
  CheckCircle,
  Settings,
  FileText,
  Heart,
  Users,
  Plus,
  Edit,
  Trash2,
  X,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Available icons for core values
const AVAILABLE_ICONS = ['Heart', 'Users', 'Target', 'Globe', 'Star', 'Award', 'Shield', 'Zap'];

export function ContentManagement() {
  // Settings state
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [pageContent, setPageContent] = useState<PageContent | null>(null);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [teamRoles, setTeamRoles] = useState<TeamRole[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state for Core Values
  const [coreValueDialogOpen, setCoreValueDialogOpen] = useState(false);
  const [editingCoreValue, setEditingCoreValue] = useState<CoreValue | null>(null);
  const [coreValueForm, setCoreValueForm] = useState({ title: '', description: '', icon: 'Heart' });
  
  // Dialog state for Team Roles
  const [teamRoleDialogOpen, setTeamRoleDialogOpen] = useState(false);
  const [editingTeamRole, setEditingTeamRole] = useState<TeamRole | null>(null);
  const [teamRoleForm, setTeamRoleForm] = useState({ role_title: '', responsibilities: '' });
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'coreValue' | 'teamRole'; id: number; name: string } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [settingsRes, contentRes, valuesRes, rolesRes] = await Promise.all([
        adminSettingsService.getSettings(),
        adminSettingsService.getPageContent('about'),
        adminSettingsService.getCoreValues(),
        adminSettingsService.getTeamRoles(),
      ]);
      
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      
      if (contentRes.success && contentRes.data) {
        setPageContent(contentRes.data);
      }
      
      if (valuesRes.success && valuesRes.data) {
        setCoreValues(valuesRes.data);
      }
      
      if (rolesRes.success && rolesRes.data) {
        setTeamRoles(rolesRes.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load content');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Save Site Settings
  const handleSaveSettings = async () => {
    if (!settings) return;
    
    try {
      setSaving(true);
      setError(null);
      const response = await adminSettingsService.updateSettings(settings);
      if (response.success) {
        showSuccess('Site settings saved successfully!');
      }
    } catch (err) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Save Page Content
  const handleSavePageContent = async () => {
    if (!pageContent) return;
    
    try {
      setSaving(true);
      setError(null);
      const response = await adminSettingsService.updatePageContent('about', pageContent);
      if (response.success) {
        showSuccess('Page content saved successfully!');
      }
    } catch (err) {
      setError('Failed to save page content');
    } finally {
      setSaving(false);
    }
  };

  // Core Values handlers
  const openCoreValueDialog = (value?: CoreValue) => {
    if (value) {
      setEditingCoreValue(value);
      setCoreValueForm({ title: value.title, description: value.description, icon: value.icon });
    } else {
      setEditingCoreValue(null);
      setCoreValueForm({ title: '', description: '', icon: 'Heart' });
    }
    setCoreValueDialogOpen(true);
  };

  const handleSaveCoreValue = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (editingCoreValue) {
        await adminSettingsService.updateCoreValue(editingCoreValue.id, coreValueForm);
        setCoreValues(coreValues.map(v => 
          v.id === editingCoreValue.id 
            ? { ...v, ...coreValueForm }
            : v
        ));
        showSuccess('Core value updated!');
      } else {
        const response = await adminSettingsService.createCoreValue(coreValueForm);
        if (response.success && response.data) {
          setCoreValues([...coreValues, { 
            id: response.data.id, 
            ...coreValueForm, 
            order_position: coreValues.length + 1 
          }]);
          showSuccess('Core value created!');
        }
      }
      
      setCoreValueDialogOpen(false);
    } catch (err) {
      setError('Failed to save core value');
    } finally {
      setSaving(false);
    }
  };

  // Team Roles handlers
  const openTeamRoleDialog = (role?: TeamRole) => {
    if (role) {
      setEditingTeamRole(role);
      setTeamRoleForm({ role_title: role.role_title, responsibilities: role.responsibilities });
    } else {
      setEditingTeamRole(null);
      setTeamRoleForm({ role_title: '', responsibilities: '' });
    }
    setTeamRoleDialogOpen(true);
  };

  const handleSaveTeamRole = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (editingTeamRole) {
        await adminSettingsService.updateTeamRole(editingTeamRole.id, teamRoleForm);
        setTeamRoles(teamRoles.map(r => 
          r.id === editingTeamRole.id 
            ? { ...r, ...teamRoleForm }
            : r
        ));
        showSuccess('Team role updated!');
      } else {
        const response = await adminSettingsService.createTeamRole(teamRoleForm);
        if (response.success && response.data) {
          setTeamRoles([...teamRoles, { 
            id: response.data.id, 
            ...teamRoleForm, 
            order_position: teamRoles.length + 1 
          }]);
          showSuccess('Team role created!');
        }
      }
      
      setTeamRoleDialogOpen(false);
    } catch (err) {
      setError('Failed to save team role');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const confirmDelete = (type: 'coreValue' | 'teamRole', id: number, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      setSaving(true);
      
      if (itemToDelete.type === 'coreValue') {
        await adminSettingsService.deleteCoreValue(itemToDelete.id);
        setCoreValues(coreValues.filter(v => v.id !== itemToDelete.id));
        showSuccess('Core value deleted!');
      } else {
        await adminSettingsService.deleteTeamRole(itemToDelete.id);
        setTeamRoles(teamRoles.filter(r => r.id !== itemToDelete.id));
        showSuccess('Team role deleted!');
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setError('Failed to delete item');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Content Management</h1>
        <p className="text-gray-600">Manage site settings, content, and page elements</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Tabs */}
      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-2xl">
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Settings</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Content</span>
          </TabsTrigger>
          <TabsTrigger value="values" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Values</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Team</span>
          </TabsTrigger>
        </TabsList>

        {/* Site Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Site Settings</CardTitle>
              <CardDescription>
                Edit the main site settings displayed on the homepage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {settings && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="hero_heading">Hero Heading</Label>
                    <Input
                      id="hero_heading"
                      value={settings.hero_heading || ''}
                      onChange={(e) => setSettings({ ...settings, hero_heading: e.target.value })}
                      placeholder="Empowering African Youth"
                    />
                    <p className="text-sm text-gray-500">Main heading on the homepage hero section</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero_description">Hero Description</Label>
                    <Textarea
                      id="hero_description"
                      value={settings.hero_description || ''}
                      onChange={(e) => setSettings({ ...settings, hero_description: e.target.value })}
                      placeholder="Creating positive change across eight countries..."
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-gray-500">Subtitle text below the hero heading</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hero_video_url">Hero Video URL (Optional)</Label>
                    <Input
                      id="hero_video_url"
                      value={settings.hero_video_url || ''}
                      onChange={(e) => setSettings({ ...settings, hero_video_url: e.target.value })}
                      placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    />
                    <p className="text-sm text-gray-500">YouTube or Vimeo video URL to display in the hero section (leave empty to hide video)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mission_statement">Mission Statement</Label>
                    <Textarea
                      id="mission_statement"
                      value={settings.mission_statement || ''}
                      onChange={(e) => setSettings({ ...settings, mission_statement: e.target.value })}
                      placeholder="Our mission is to..."
                      className="min-h-[150px]"
                    />
                    <p className="text-sm text-gray-500">Displayed on Home and About pages</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vision_statement">Vision Statement</Label>
                    <Textarea
                      id="vision_statement"
                      value={settings.vision_statement || ''}
                      onChange={(e) => setSettings({ ...settings, vision_statement: e.target.value })}
                      placeholder="Our vision is..."
                      className="min-h-[150px]"
                    />
                    <p className="text-sm text-gray-500">Displayed on the About page</p>
                  </div>

                  <Button onClick={handleSaveSettings} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Settings
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Page Content Tab */}
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>About Page Content</CardTitle>
              <CardDescription>
                Edit the "Our Story" section on the About page
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {pageContent && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="hero_text">About Page Hero Text</Label>
                    <Textarea
                      id="hero_text"
                      value={pageContent.hero_text || ''}
                      onChange={(e) => setPageContent({ ...pageContent, hero_text: e.target.value })}
                      placeholder="A youth-led nonprofit organization..."
                      className="min-h-[100px]"
                    />
                    <p className="text-sm text-gray-500">Subtitle on the About page hero section</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="our_story">Our Story</Label>
                    <Textarea
                      id="our_story"
                      value={pageContent.our_story || ''}
                      onChange={(e) => setPageContent({ ...pageContent, our_story: e.target.value })}
                      placeholder="Youths4Change Initiative was founded..."
                      className="min-h-[300px]"
                    />
                    <p className="text-sm text-gray-500">
                      Full story content. Use line breaks for paragraphs. 
                      Use • for bullet points.
                    </p>
                  </div>

                  <Button onClick={handleSavePageContent} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Content
                      </>
                    )}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Core Values Tab */}
        <TabsContent value="values">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Core Values</CardTitle>
                <CardDescription>
                  Manage the organization's core values displayed on the About page
                </CardDescription>
              </div>
              <Button onClick={() => openCoreValueDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Value
              </Button>
            </CardHeader>
            <CardContent>
              {coreValues.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Heart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No core values yet</p>
                  <p className="text-sm">Click "Add Value" to create one</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {coreValues.map((value) => (
                    <div 
                      key={value.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-600 text-sm font-semibold">
                            {value.icon.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold">{value.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{value.description}</p>
                          <p className="text-xs text-gray-400 mt-1">Icon: {value.icon}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openCoreValueDialog(value)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDelete('coreValue', value.id, value.title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Roles Tab */}
        <TabsContent value="team">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Team Roles</CardTitle>
                <CardDescription>
                  Manage the team structure displayed on the About page
                </CardDescription>
              </div>
              <Button onClick={() => openTeamRoleDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Role
              </Button>
            </CardHeader>
            <CardContent>
              {teamRoles.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No team roles yet</p>
                  <p className="text-sm">Click "Add Role" to create one</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {teamRoles.map((role) => (
                    <div 
                      key={role.id}
                      className="flex items-start justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div>
                        <h3 className="font-semibold">{role.role_title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{role.responsibilities}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => openTeamRoleDialog(role)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => confirmDelete('teamRole', role.id, role.role_title)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Core Value Dialog */}
      <Dialog open={coreValueDialogOpen} onOpenChange={setCoreValueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCoreValue ? 'Edit Core Value' : 'Add Core Value'}
            </DialogTitle>
            <DialogDescription>
              {editingCoreValue 
                ? 'Update the core value details below'
                : 'Fill in the details for the new core value'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cv_title">Title</Label>
              <Input
                id="cv_title"
                value={coreValueForm.title}
                onChange={(e) => setCoreValueForm({ ...coreValueForm, title: e.target.value })}
                placeholder="e.g., Empowerment"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cv_description">Description</Label>
              <Textarea
                id="cv_description"
                value={coreValueForm.description}
                onChange={(e) => setCoreValueForm({ ...coreValueForm, description: e.target.value })}
                placeholder="Describe this core value..."
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cv_icon">Icon</Label>
              <Select
                value={coreValueForm.icon}
                onValueChange={(value) => setCoreValueForm({ ...coreValueForm, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_ICONS.map((icon) => (
                    <SelectItem key={icon} value={icon}>
                      {icon}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500">
                Icons available: Heart, Users, Target, Globe, Star, Award, Shield, Zap
              </p>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setCoreValueDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCoreValue} disabled={saving || !coreValueForm.title || !coreValueForm.description}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Role Dialog */}
      <Dialog open={teamRoleDialogOpen} onOpenChange={setTeamRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTeamRole ? 'Edit Team Role' : 'Add Team Role'}
            </DialogTitle>
            <DialogDescription>
              {editingTeamRole 
                ? 'Update the team role details below'
                : 'Fill in the details for the new team role'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tr_title">Role Title</Label>
              <Input
                id="tr_title"
                value={teamRoleForm.role_title}
                onChange={(e) => setTeamRoleForm({ ...teamRoleForm, role_title: e.target.value })}
                placeholder="e.g., Executive Director"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tr_responsibilities">Responsibilities</Label>
              <Textarea
                id="tr_responsibilities"
                value={teamRoleForm.responsibilities}
                onChange={(e) => setTeamRoleForm({ ...teamRoleForm, responsibilities: e.target.value })}
                placeholder="Describe the responsibilities..."
                className="min-h-[100px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setTeamRoleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveTeamRole} disabled={saving || !teamRoleForm.role_title || !teamRoleForm.responsibilities}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {itemToDelete?.type === 'coreValue' ? 'Core Value' : 'Team Role'}</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{itemToDelete?.name}"? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={saving}
              className="bg-red-600 hover:bg-red-700"
            >
              {saving ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}