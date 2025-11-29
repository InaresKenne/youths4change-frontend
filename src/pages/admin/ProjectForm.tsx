import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminProjectService } from '@/services/adminProjectService';
import type {ProjectFormData } from '@/services/adminProjectService';
import { COUNTRIES } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

interface ProjectFormProps {
  mode: 'create' | 'edit';
}

export function ProjectForm({ mode }: ProjectFormProps) {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    country: '',
    beneficiaries_count: 0,
    budget: 0,
    status: 'active',
    image_url: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof ProjectFormData, string>>>({});
  const [loading, setLoading] = useState(mode === 'edit');
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === 'edit' && id) {
      loadProject(parseInt(id));
    }
  }, [mode, id]);

  const loadProject = async (projectId: number) => {
    try {
      const response = await adminProjectService.getById(projectId);
      if (response.success && response.data) {
        const project = response.data;
        setFormData({
          name: project.name,
          description: project.description,
          country: project.country,
          beneficiaries_count: project.beneficiaries_count,
          budget: project.budget,
          status: project.status,
          image_url: project.image_url || '',
        });
      }
    } catch (error) {
      console.error('Error loading project:', error);
      setApiError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ProjectFormData, string>> = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Project name is required';
    } else if (formData.name.length < 5 || formData.name.length > 100) {
      newErrors.name = 'Name must be 5-100 characters';
    }

    // Description validation
    if (!formData.description) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 50 || formData.description.length > 1000) {
      newErrors.description = 'Description must be 50-1000 characters';
    }

    // Country validation
    if (!formData.country) {
      newErrors.country = 'Please select a country';
    }

    // Beneficiaries validation
    if (formData.beneficiaries_count < 0) {
      newErrors.beneficiaries_count = 'Beneficiaries cannot be negative';
    }

    // Budget validation
    if (formData.budget < 0) {
      newErrors.budget = 'Budget cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProjectFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      
      if (mode === 'create') {
        const response = await adminProjectService.create(formData);
        if (response.success) {
          navigate('/admin/projects');
        }
      } else if (mode === 'edit' && id) {
        const response = await adminProjectService.update(parseInt(id), formData);
        if (response.success) {
          navigate('/admin/projects');
        }
      }
    } catch (err: any) {
      console.error('Error saving project:', err);
      setApiError(err.response?.data?.error || 'Failed to save project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardContent className="pt-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/projects')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {mode === 'create' ? 'Create New Project' : 'Edit Project'}
          </h1>
          <p className="text-gray-600">
            {mode === 'create' 
              ? 'Add a new project to your organization' 
              : 'Update project information'
            }
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Fill in the project information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apiError && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{apiError}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Project Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="e.g., EmpowerHer Initiative"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe the project, its goals, and impact..."
                className={`min-h-[150px] ${errors.description ? 'border-red-500' : ''}`}
              />
              <div className="flex justify-between text-sm">
                <span className={
                  formData.description.length < 50 || formData.description.length > 1000 
                    ? 'text-red-600' 
                    : 'text-gray-500'
                }>
                  {formData.description.length} / 50-1000 characters
                </span>
              </div>
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            {/* Country and Status Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange('country', value)}
                >
                  <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRIES.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.country && (
                  <p className="text-sm text-red-600">{errors.country}</p>
                )}
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Beneficiaries and Budget Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Beneficiaries */}
              <div className="space-y-2">
                <Label htmlFor="beneficiaries_count">Number of Beneficiaries</Label>
                <Input
                  id="beneficiaries_count"
                  type="number"
                  min="0"
                  value={formData.beneficiaries_count}
                  onChange={(e) => handleInputChange('beneficiaries_count', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.beneficiaries_count ? 'border-red-500' : ''}
                />
                {errors.beneficiaries_count && (
                  <p className="text-sm text-red-600">{errors.beneficiaries_count}</p>
                )}
              </div>

              {/* Budget */}
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (USD)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.budget}
                    onChange={(e) => handleInputChange('budget', parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className={`pl-7 ${errors.budget ? 'border-red-500' : ''}`}
                  />
                </div>
                {errors.budget && (
                  <p className="text-sm text-red-600">{errors.budget}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (Optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => handleInputChange('image_url', e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-sm text-gray-500">
                Enter a URL for the project image. Leave blank for no image.
              </p>
              {formData.image_url && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">Preview:</p>
                  <img 
                    src={formData.image_url} 
                    alt="Preview" 
                    className="h-32 w-48 object-cover rounded-lg border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {mode === 'create' ? 'Create Project' : 'Save Changes'}
                  </>
                )}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/admin/projects')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}