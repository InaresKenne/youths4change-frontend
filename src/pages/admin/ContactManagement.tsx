import { useState, useEffect } from 'react';
import { adminContactService } from '@/services/adminContactService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import type { ContactInfo, SocialMedia, RegionalOffice } from '@/types';

// Countries list
const COUNTRIES = [
  'Ghana',
  'Kenya',
  'Nigeria',
  'South Africa',
  'Uganda',
  'Tanzania',
  'Rwanda',
  'Cameroon',
] as const;
import { 
  Save, 
  Loader2, 
  CheckCircle,
  Mail,
  Phone,
  Globe,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
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

// Icon mapping
const iconMap: Record<string, any> = {
  Mail, Phone, Globe, MapPin, Facebook, Twitter, Instagram, Linkedin
};

// Available social platforms
const SOCIAL_PLATFORMS = [
  { platform: 'facebook', name: 'Facebook', icon: 'Facebook', color: 'text-blue-600 hover:bg-blue-50' },
  { platform: 'twitter', name: 'Twitter', icon: 'Twitter', color: 'text-sky-500 hover:bg-sky-50' },
  { platform: 'instagram', name: 'Instagram', icon: 'Instagram', color: 'text-pink-600 hover:bg-pink-50' },
  { platform: 'linkedin', name: 'LinkedIn', icon: 'Linkedin', color: 'text-blue-700 hover:bg-blue-50' },
  { platform: 'youtube', name: 'YouTube', icon: 'Globe', color: 'text-red-600 hover:bg-red-50' },
  { platform: 'tiktok', name: 'TikTok', icon: 'Globe', color: 'text-gray-800 hover:bg-gray-50' },
];

export function ContactManagement() {
  // Data state
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [regionalOffices, setRegionalOffices] = useState<RegionalOffice[]>([]);
  
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Contact Info edit state
  const [editingContact, setEditingContact] = useState<ContactInfo | null>(null);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);
  
  // Social Media dialog state
  const [socialDialogOpen, setSocialDialogOpen] = useState(false);
  const [editingSocial, setEditingSocial] = useState<SocialMedia | null>(null);
  const [socialForm, setSocialForm] = useState({
    platform: '',
    platform_name: '',
    url: '',
    icon: '',
    color_class: '',
    is_active: true,
  });
  
  // Regional Office dialog state
  const [officeDialogOpen, setOfficeDialogOpen] = useState(false);
  const [editingOffice, setEditingOffice] = useState<RegionalOffice | null>(null);
  const [officeForm, setOfficeForm] = useState({
    country: '',
    email: '',
    phone: '',
    address: '',
    is_active: true,
  });
  
  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ 
    type: 'social' | 'office'; 
    id: number; 
    name: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [contactRes, socialRes, officeRes] = await Promise.all([
        adminContactService.getContactInfo(),
        adminContactService.getSocialMedia(),
        adminContactService.getRegionalOffices(),
      ]);
      
      if (contactRes.success && contactRes.data) {
        setContactInfo(contactRes.data);
      }
      
      if (socialRes.success && socialRes.data) {
        setSocialMedia(socialRes.data);
      }
      
      if (officeRes.success && officeRes.data) {
        setRegionalOffices(officeRes.data);
      }
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load contact information');
    } finally {
      setLoading(false);
    }
  };

  const showSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  // Contact Info handlers
  const openContactDialog = (contact: ContactInfo) => {
    setEditingContact({ ...contact });
    setContactDialogOpen(true);
  };

  const handleSaveContact = async () => {
    if (!editingContact) return;
    
    try {
      setSaving(true);
      await adminContactService.updateContactInfo(editingContact.id, editingContact);
      setContactInfo(contactInfo.map(c => 
        c.id === editingContact.id ? editingContact : c
      ));
      setContactDialogOpen(false);
      showSuccess('Contact info updated!');
    } catch (err) {
      setError('Failed to save contact info');
    } finally {
      setSaving(false);
    }
  };

  // Social Media handlers
  const openSocialDialog = (social?: SocialMedia) => {
    if (social) {
      setEditingSocial(social);
      setSocialForm({
        platform: social.platform,
        platform_name: social.platform_name,
        url: social.url,
        icon: social.icon,
        color_class: social.color_class,
        is_active: social.is_active,
      });
    } else {
      setEditingSocial(null);
      setSocialForm({
        platform: '',
        platform_name: '',
        url: '',
        icon: '',
        color_class: '',
        is_active: true,
      });
    }
    setSocialDialogOpen(true);
  };

  const handlePlatformSelect = (platform: string) => {
    const selected = SOCIAL_PLATFORMS.find(p => p.platform === platform);
    if (selected) {
      setSocialForm({
        ...socialForm,
        platform: selected.platform,
        platform_name: selected.name,
        icon: selected.icon,
        color_class: selected.color,
      });
    }
  };

  const handleSaveSocial = async () => {
    try {
      setSaving(true);
      
      if (editingSocial) {
        await adminContactService.updateSocialMedia(editingSocial.id, socialForm);
        setSocialMedia(socialMedia.map(s => 
          s.id === editingSocial.id ? { ...s, ...socialForm } : s
        ));
        showSuccess('Social media link updated!');
      } else {
        const response = await adminContactService.createSocialMedia(socialForm);
        if (response.success && response.data) {
          setSocialMedia([...socialMedia, { 
            id: response.data.id, 
            ...socialForm,
            order_position: socialMedia.length + 1
          } as SocialMedia]);
          showSuccess('Social media link created!');
        }
      }
      
      setSocialDialogOpen(false);
    } catch (err) {
      setError('Failed to save social media link');
    } finally {
      setSaving(false);
    }
  };

  // Regional Office handlers
  const openOfficeDialog = (office?: RegionalOffice) => {
    if (office) {
      setEditingOffice(office);
      setOfficeForm({
        country: office.country,
        email: office.email,
        phone: office.phone,
        address: office.address || '',
        is_active: office.is_active,
      });
    } else {
      setEditingOffice(null);
      setOfficeForm({
        country: '',
        email: '',
        phone: '',
        address: '',
        is_active: true,
      });
    }
    setOfficeDialogOpen(true);
  };

  const handleSaveOffice = async () => {
    try {
      setSaving(true);
      
      if (editingOffice) {
        await adminContactService.updateRegionalOffice(editingOffice.id, officeForm);
        setRegionalOffices(regionalOffices.map(o => 
          o.id === editingOffice.id ? { ...o, ...officeForm } : o
        ));
        showSuccess('Regional office updated!');
      } else {
        const response = await adminContactService.createRegionalOffice(officeForm);
        if (response.success && response.data) {
          setRegionalOffices([...regionalOffices, { 
            id: response.data.id, 
            ...officeForm,
            order_position: regionalOffices.length + 1
          } as RegionalOffice]);
          showSuccess('Regional office created!');
        }
      }
      
      setOfficeDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save regional office');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const confirmDelete = (type: 'social' | 'office', id: number, name: string) => {
    setItemToDelete({ type, id, name });
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      setSaving(true);
      
      if (itemToDelete.type === 'social') {
        await adminContactService.deleteSocialMedia(itemToDelete.id);
        setSocialMedia(socialMedia.filter(s => s.id !== itemToDelete.id));
        showSuccess('Social media link deleted!');
      } else {
        await adminContactService.deleteRegionalOffice(itemToDelete.id);
        setRegionalOffices(regionalOffices.filter(o => o.id !== itemToDelete.id));
        showSuccess('Regional office deleted!');
      }
      
      setDeleteDialogOpen(false);
      setItemToDelete(null);
    } catch (err) {
      setError('Failed to delete item');
    } finally {
      setSaving(false);
    }
  };

  // Get used countries (for filtering in office creation)
  const usedCountries = regionalOffices.map(o => o.country);
// Suggest countries that aren't already used
const availableCountries = COUNTRIES.filter(c => !usedCountries.includes(c));

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
        <h1 className="text-3xl font-bold">Contact Management</h1>
        <p className="text-gray-600">Manage contact information, social media, and regional offices</p>
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
      <Tabs defaultValue="contact" className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md">
          <TabsTrigger value="contact" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Contact</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline">Social</span>
          </TabsTrigger>
          <TabsTrigger value="offices" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Offices</span>
          </TabsTrigger>
        </TabsList>

        {/* Main Contact Info Tab */}
        <TabsContent value="contact">
          <Card>
            <CardHeader>
              <CardTitle>Main Contact Information</CardTitle>
              <CardDescription>
                Edit the primary contact details displayed on the Contact page
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contactInfo.map((contact) => {
                  const Icon = iconMap[contact.icon] || Globe;
                  return (
                    <div 
                      key={contact.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{contact.label}</h3>
                          <p className="text-sm text-gray-600">{contact.value}</p>
                          {contact.link && (
                            <p className="text-xs text-blue-600">{contact.link}</p>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => openContactDialog(contact)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Social Media Links</CardTitle>
                <CardDescription>
                  Manage social media profiles displayed on the Contact page
                </CardDescription>
              </div>
              <Button onClick={() => openSocialDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Social
              </Button>
            </CardHeader>
            <CardContent>
              {socialMedia.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Globe className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No social media links yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {socialMedia.map((social) => {
                    const Icon = iconMap[social.icon] || Globe;
                    return (
                      <div 
                        key={social.id}
                        className={`flex items-center justify-between p-4 border rounded-lg ${
                          social.is_active ? 'hover:bg-gray-50' : 'bg-gray-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                            social.color_class?.includes('blue-600') ? 'bg-blue-100' :
                            social.color_class?.includes('sky-500') ? 'bg-sky-100' :
                            social.color_class?.includes('pink-600') ? 'bg-pink-100' :
                            social.color_class?.includes('blue-700') ? 'bg-blue-100' :
                            'bg-gray-100'
                          }`}>
                            <Icon className={`h-5 w-5 ${social.color_class?.split(' ')[0] || 'text-gray-600'}`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{social.platform_name}</h3>
                              {!social.is_active && (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </div>
                            <a 
                              href={social.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-sm text-blue-600 hover:underline"
                            >
                              {social.url}
                            </a>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openSocialDialog(social)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => confirmDelete('social', social.id, social.platform_name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Regional Offices Tab */}
        <TabsContent value="offices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Regional Offices</CardTitle>
                <CardDescription>
                  Manage regional office contacts for each country
                </CardDescription>
              </div>
              <Button onClick={() => openOfficeDialog()}>
  <Plus className="mr-2 h-4 w-4" />
  Add Office
</Button>
            </CardHeader>
            <CardContent>
              {regionalOffices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No regional offices yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {regionalOffices.map((office) => (
                    <div 
                      key={office.id}
                      className={`p-4 border rounded-lg ${
                        office.is_active ? 'hover:bg-gray-50' : 'bg-gray-100 opacity-60'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{office.country}</h3>
                          {!office.is_active && (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openOfficeDialog(office)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => confirmDelete('office', office.id, office.country)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <span className="truncate">{office.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{office.phone}</span>
                        </div>
                        {office.address && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>{office.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Contact Info Edit Dialog */}
      <Dialog open={contactDialogOpen} onOpenChange={setContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Info</DialogTitle>
            <DialogDescription>
              Update the contact information details
            </DialogDescription>
          </DialogHeader>
          
          {editingContact && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="contact_label">Label</Label>
                <Input
                  id="contact_label"
                  value={editingContact.label}
                  onChange={(e) => setEditingContact({ ...editingContact, label: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_value">Value</Label>
                <Input
                  id="contact_value"
                  value={editingContact.value}
                  onChange={(e) => setEditingContact({ ...editingContact, value: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact_link">Link (optional)</Label>
                <Input
                  id="contact_link"
                  value={editingContact.link || ''}
                  onChange={(e) => setEditingContact({ ...editingContact, link: e.target.value })}
                  placeholder="mailto:email@example.com or tel:+123456789"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveContact} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Social Media Dialog */}
      <Dialog open={socialDialogOpen} onOpenChange={setSocialDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingSocial ? 'Edit Social Media' : 'Add Social Media'}
            </DialogTitle>
            <DialogDescription>
              {editingSocial 
                ? 'Update the social media link details'
                : 'Add a new social media profile'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {!editingSocial && (
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={socialForm.platform}
                  onValueChange={handlePlatformSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_PLATFORMS.map((p) => (
                      <SelectItem key={p.platform} value={p.platform}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="social_url">URL</Label>
              <Input
                id="social_url"
                value={socialForm.url}
                onChange={(e) => setSocialForm({ ...socialForm, url: e.target.value })}
                placeholder="https://facebook.com/yourpage"
              />
            </div>
            
            {editingSocial && (
              <div className="flex items-center justify-between">
                <Label htmlFor="social_active">Active</Label>
                <Switch
                  id="social_active"
                  checked={socialForm.is_active}
                  onCheckedChange={(checked) => setSocialForm({ ...socialForm, is_active: checked })}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSocialDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveSocial} 
              disabled={saving || !socialForm.platform || !socialForm.url}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Regional Office Dialog */}
      <Dialog open={officeDialogOpen} onOpenChange={setOfficeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingOffice ? 'Edit Regional Office' : 'Add Regional Office'}
            </DialogTitle>
            <DialogDescription>
              {editingOffice 
                ? 'Update the regional office details'
                : 'Add a new regional office'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
<div className="space-y-2">
  <Label htmlFor="office_country">Country</Label>
  {editingOffice ? (
    <Input value={officeForm.country} disabled />
  ) : (
    <div className="space-y-2">
      <Input
        id="office_country"
        value={officeForm.country}
        onChange={(e) => setOfficeForm({ ...officeForm, country: e.target.value })}
        placeholder="Enter country name"
        list="country-suggestions"
      />
      <datalist id="country-suggestions">
        {availableCountries.map((country) => (
          <option key={country} value={country} />
        ))}
      </datalist>
      <p className="text-xs text-gray-500">
        Type a country name or select from suggestions
      </p>
    </div>
  )}
</div>
            
            <div className="space-y-2">
              <Label htmlFor="office_email">Email</Label>
              <Input
                id="office_email"
                type="email"
                value={officeForm.email}
                onChange={(e) => setOfficeForm({ ...officeForm, email: e.target.value })}
                placeholder="country@youths4change.org"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="office_phone">Phone</Label>
              <Input
                id="office_phone"
                value={officeForm.phone}
                onChange={(e) => setOfficeForm({ ...officeForm, phone: e.target.value })}
                placeholder="+1 234 567 8900"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="office_address">City/Address (optional)</Label>
              <Input
                id="office_address"
                value={officeForm.address}
                onChange={(e) => setOfficeForm({ ...officeForm, address: e.target.value })}
                placeholder="City name"
              />
            </div>
            
            {editingOffice && (
              <div className="flex items-center justify-between">
                <Label htmlFor="office_active">Active</Label>
                <Switch
                  id="office_active"
                  checked={officeForm.is_active}
                  onCheckedChange={(checked) => setOfficeForm({ ...officeForm, is_active: checked })}
                />
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setOfficeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveOffice} 
              disabled={saving || !officeForm.country || !officeForm.email || !officeForm.phone}
            >
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {itemToDelete?.type === 'social' ? 'Social Media' : 'Regional Office'}
            </AlertDialogTitle>
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