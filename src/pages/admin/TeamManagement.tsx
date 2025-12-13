import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Save, X, Users } from 'lucide-react';
import { adminTeamService } from '@/services/teamService';
import type { Founder, TeamMember } from '@/types';
import { ImageUpload } from '@/components/ui/image-upload';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { contactService } from '@/services/contactService';
import { clearCacheEntry } from '@/services/api';

export function TeamManagement() {
  const [founder, setFounder] = useState<Founder | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingFounder, setEditingFounder] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [deletingMember, setDeletingMember] = useState<TeamMember | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [founderForm, setFounderForm] = useState<Partial<Founder>>({});
  const [memberForm, setMemberForm] = useState<Partial<TeamMember>>({
    role_type: 'executive',
    is_active: true,
    order_position: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [founderRes, membersRes, countriesRes] = await Promise.all([
        adminTeamService.getFounder(),
        adminTeamService.getAllMembers(),
        contactService.getOfficeCountries(),
      ]);

      if (founderRes.success && founderRes.data) {
        setFounder(founderRes.data);
        setFounderForm(founderRes.data);
      }

      if (membersRes.success && membersRes.data) {
        setTeamMembers(membersRes.data);
      }

      if (countriesRes.success && countriesRes.data) {
        setCountries(countriesRes.data);
      }
    } catch (error) {
      console.error('Error loading team data:', error);
      showMessage('error', 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  const handleSaveFounder = async () => {
    try {
      console.log('Saving founder data:', founderForm);
      const response = await adminTeamService.updateFounder(founderForm);
      console.log('Update response:', response);
      if (response.success) {
        // Clear cache for founder data to force refresh
        clearCacheEntry('/api/team/founder');
        clearCacheEntry('/api/team/admin/founder');
        
        showMessage('success', 'Founder information updated successfully');
        setEditingFounder(false);
        await loadData(); // Wait for data to reload
      } else {
        showMessage('error', response.error || 'Failed to update founder information');
      }
    } catch (error: any) {
      console.error('Error updating founder:', error);
      showMessage('error', error?.response?.data?.error || 'Failed to update founder information');
    }
  };

  const handleSaveMember = async () => {
    try {
      if (editingMember) {
        console.log('Updating member:', editingMember.id, memberForm);
        const response = await adminTeamService.updateMember(editingMember.id, memberForm);
        console.log('Update response:', response);
        if (response.success) {
          // Clear cache for team members
          clearCacheEntry('/api/team/members');
          clearCacheEntry('/api/team/admin/members');
          
          showMessage('success', 'Team member updated successfully');
          setEditingMember(null);
          await loadData();
        } else {
          showMessage('error', response.error || 'Failed to update team member');
        }
      } else {
        console.log('Creating new member:', memberForm);
        const response = await adminTeamService.createMember(memberForm);
        console.log('Create response:', response);
        if (response.success) {
          // Clear cache for team members
          clearCacheEntry('/api/team/members');
          clearCacheEntry('/api/team/admin/members');
          
          showMessage('success', 'Team member created successfully');
          setShowAddMember(false);
          setMemberForm({ role_type: 'executive', is_active: true, order_position: 0 });
          await loadData();
        } else {
          showMessage('error', response.error || 'Failed to create team member');
        }
      }
    } catch (error: any) {
      console.error('Error saving team member:', error);
      showMessage('error', error?.response?.data?.error || 'Failed to save team member');
    }
  };

  const handleDeleteMember = async () => {
    if (!deletingMember) return;

    try {
      const response = await adminTeamService.deleteMember(deletingMember.id);
      if (response.success) {
        // Clear cache for team members
        clearCacheEntry('/api/team/members');
        clearCacheEntry('/api/team/admin/members');
        
        showMessage('success', 'Team member deleted successfully');
        setDeletingMember(null);
        await loadData();
      } else {
        showMessage('error', response.error || 'Failed to delete team member');
        setDeletingMember(null);
      }
    } catch (error: any) {
      console.error('Delete error:', error);
      showMessage('error', error?.response?.data?.error || 'Failed to delete team member');
      setDeletingMember(null);
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setMemberForm(member);
  };

  const handleCancelEdit = () => {
    setEditingMember(null);
    setShowAddMember(false);
    setMemberForm({ role_type: 'executive', is_active: true, order_position: 0 });
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Team Management</h1>
      </div>

      {message && (
        <Alert className={`mb-4 ${message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Founder Section */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Founder Information</CardTitle>
              <CardDescription>Manage founder profile and bio</CardDescription>
            </div>
            {!editingFounder && (
              <Button onClick={() => setEditingFounder(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editingFounder ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Name *</Label>
                  <Input
                    value={founderForm.name || ''}
                    onChange={(e) => setFounderForm({ ...founderForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Title *</Label>
                  <Input
                    value={founderForm.title || ''}
                    onChange={(e) => setFounderForm({ ...founderForm, title: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Bio *</Label>
                <Textarea
                  value={founderForm.bio || ''}
                  onChange={(e) => setFounderForm({ ...founderForm, bio: e.target.value })}
                  rows={6}
                  placeholder="Write the founder's biography..."
                />
              </div>

              <div>
                <Label>Profile Image</Label>
                <ImageUpload
                  value={founderForm.image_url || ''}
                  onChange={(url, publicId) => {
                    setFounderForm({ ...founderForm, image_url: url, image_public_id: publicId });
                  }}
                  folder="team/founder"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={founderForm.email || ''}
                    onChange={(e) => setFounderForm({ ...founderForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>LinkedIn URL</Label>
                  <Input
                    value={founderForm.linkedin_url || ''}
                    onChange={(e) => setFounderForm({ ...founderForm, linkedin_url: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Twitter URL</Label>
                  <Input
                    value={founderForm.twitter_url || ''}
                    onChange={(e) => setFounderForm({ ...founderForm, twitter_url: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSaveFounder}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditingFounder(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : founder ? (
            <div className="flex gap-6">
              {founder.image_url ? (
                <img src={founder.image_url} alt={founder.name} className="w-32 h-32 rounded-lg object-cover" />
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gray-200 flex items-center justify-center">
                  <Users className="w-12 h-12 text-gray-400" />
                </div>
              )}
              <div>
                <h3 className="text-xl font-bold">{founder.name}</h3>
                <p className="text-blue-600 mb-2">{founder.title}</p>
                <p className="text-gray-600 text-sm mb-2">{founder.bio}</p>
                {founder.email && <p className="text-sm text-gray-500">Email: {founder.email}</p>}
              </div>
            </div>
          ) : (
            <p className="text-gray-600">No founder information available. Click Edit to add.</p>
          )}
        </CardContent>
      </Card>

      {/* Team Members Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members and their roles</CardDescription>
            </div>
            <Button onClick={() => setShowAddMember(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Add/Edit Member Form */}
          {(showAddMember || editingMember) && (
            <Card className="mb-6 border-blue-200 bg-blue-50/50">
              <CardHeader>
                <CardTitle className="text-lg">
                  {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Name *</Label>
                    <Input
                      value={memberForm.name || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Position *</Label>
                    <Input
                      value={memberForm.position || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, position: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Role Type *</Label>
                    <Select
                      value={memberForm.role_type}
                      onValueChange={(value: any) => setMemberForm({ ...memberForm, role_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="board">Board Member</SelectItem>
                        <SelectItem value="advisor">Advisor</SelectItem>
                        <SelectItem value="volunteer">Volunteer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Country</Label>
                    <Select
                      value={memberForm.country || ''}
                      onValueChange={(value) => setMemberForm({ ...memberForm, country: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.length > 0 ? (
                          countries.map((country: string) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="" disabled>
                            No countries available - Add projects first
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Bio</Label>
                  <Textarea
                    value={memberForm.bio || ''}
                    onChange={(e) => setMemberForm({ ...memberForm, bio: e.target.value })}
                    rows={4}
                    placeholder="Brief bio about this team member..."
                  />
                </div>

                <div>
                  <Label>Profile Image</Label>
                  <ImageUpload
                    value={memberForm.image_url || ''}
                    onChange={(url, publicId) => {
                      setMemberForm({ ...memberForm, image_url: url, image_public_id: publicId });
                    }}
                    folder="team/members"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={memberForm.email || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={memberForm.linkedin_url || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, linkedin_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Twitter URL</Label>
                    <Input
                      value={memberForm.twitter_url || ''}
                      onChange={(e) => setMemberForm({ ...memberForm, twitter_url: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveMember}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingMember ? 'Update' : 'Create'}
                  </Button>
                  <Button variant="outline" onClick={handleCancelEdit}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Team Members List */}
          <div className="space-y-4">
            {teamMembers.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No team members yet. Click "Add Member" to get started.</p>
            ) : (
              teamMembers.map((member) => (
                <Card key={member.id} className={!member.is_active ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {member.image_url ? (
                        <img src={member.image_url} alt={member.name} className="w-16 h-16 rounded-lg object-cover" />
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                          <Users className="w-8 h-8 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1">
                        <h4 className="font-bold">{member.name}</h4>
                        <p className="text-sm text-blue-600">{member.position}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">{member.role_type}</Badge>
                          {member.country && <Badge variant="outline">{member.country}</Badge>}
                          {!member.is_active && <Badge variant="destructive">Inactive</Badge>}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditMember(member)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => setDeletingMember(member)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingMember} onOpenChange={() => setDeletingMember(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {deletingMember?.name} from the team. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMember} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
