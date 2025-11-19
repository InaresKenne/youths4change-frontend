import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import type { DonationFormData } from '@/services/donationService';
import { donationService } from '@/services/donationService';
import type { Project } from '@/types';
import {COUNTRIES } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { validationPatterns } from '@/utils/validation';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export function Donate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('project');

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  
  const [formData, setFormData] = useState<DonationFormData>({
    donor_name: '',
    email: '',
    amount: 0,
    project_id: 0,
    country: '',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof DonationFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [donationId, setDonationId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (preselectedProjectId && projects.length > 0) {
      setFormData(prev => ({ ...prev, project_id: parseInt(preselectedProjectId) }));
    }
  }, [preselectedProjectId, projects]);

  const loadProjects = async () => {
    try {
      const response = await projectService.getAll({ status: 'active' });
      if (response.success && response.data) {
        setProjects(response.data);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const validateField = (name: keyof DonationFormData, value: string | number): string | null => {
    switch (name) {
      case 'donor_name':
        if (!value) return 'Donor name is required';
        if (!validationPatterns.name.test(value.toString())) {
          return 'Name must be 2-50 characters, letters and spaces only';
        }
        return null;

case 'email':
console.log('Raw email:', JSON.stringify(value));
  console.log('Trimmed email:', JSON.stringify(value.toString().trim()));
  const email = value.toString().trim();   // <-- FIX
  if (!email) return 'Email is required';
  if (!validationPatterns.email.test(email)) {
    return 'Invalid email format';
  }
  return null;

      case 'amount':
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        if (!amount || amount <= 0) return 'Amount is required';
        if (amount < 5) return 'Minimum donation is $5';
        if (!validationPatterns.amount.test(amount.toString())) {
          return 'Invalid amount format (use XX.XX)';
        }
        return null;

      case 'project_id':
        if (!value || value === 0) return 'Please select a project';
        return null;

      case 'country':
        if (!value) return 'Please select your country';
        return null;

      default:
        return null;
    }
  };

  const handleInputChange = (field: keyof DonationFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setApiError(null);
  };

  const handleBlur = (field: keyof DonationFormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DonationFormData, string>> = {};
    
    (Object.keys(formData) as Array<keyof DonationFormData>).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await donationService.submit(formData);
      
      if (response.success && response.data) {
        setSuccess(true);
        setDonationId(response.data.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Error submitting donation:', err);
      setApiError(
        err.response?.data?.error || 'Failed to process donation. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedProject = projects.find(p => p.id === formData.project_id);

  if (success && donationId) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-900">Donation Successful!</CardTitle>
            <CardDescription className="text-lg text-green-700">
              Thank you for your generosity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-white rounded-lg p-6 space-y-3">
              <div className="flex justify-between">
                <span className="font-semibold">Donation ID:</span>
                <span>#{donationId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Amount:</span>
                <span className="text-2xl font-bold text-green-600">
                  ${formData.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Project:</span>
                <span>{selectedProject?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Donor:</span>
                <span>{formData.donor_name}</span>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Important Note</AlertTitle>
              <AlertDescription>
                This is a mock donation system for demonstration purposes. 
                No actual payment has been processed.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-gray-700">
                A confirmation email has been sent to <strong>{formData.email}</strong>
              </p>
              <div className="flex gap-4 justify-center pt-4">
                <Button onClick={() => navigate('/')}>
                  Return Home
                </Button>
                <Button variant="outline" onClick={() => navigate('/projects')}>
                  View More Projects
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl">Make a Donation</CardTitle>
                <CardDescription className="text-lg">
                  Support our mission to empower young people across Africa
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Mock Donation System</AlertTitle>
                  <AlertDescription>
                    This is a demonstration. No real payment will be processed.
                  </AlertDescription>
                </Alert>

                {apiError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{apiError}</AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Project Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="project">Select Project *</Label>
                    {loadingProjects ? (
                      <div className="text-sm text-gray-500">Loading projects...</div>
                    ) : (
                      <Select
                        value={formData.project_id.toString()}
                        onValueChange={(value) => handleInputChange('project_id', parseInt(value))}
                      >
                        <SelectTrigger className={errors.project_id ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Choose a project to support" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project.id} value={project.id.toString()}>
                              {project.name} ({project.country})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {errors.project_id && (
                      <p className="text-sm text-red-600">{errors.project_id}</p>
                    )}
                  </div>

                  {/* Donation Amount */}
                  <div className="space-y-2">
                    <Label htmlFor="amount">Donation Amount (USD) *</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="5"
                        value={formData.amount || ''}
                        onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                        onBlur={() => handleBlur('amount')}
                        placeholder="50.00"
                        className={`pl-7 ${errors.amount ? 'border-red-500' : ''}`}
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount}</p>
                    )}
                    <p className="text-sm text-gray-500">Minimum donation: $5.00</p>

                    {/* Quick Amount Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      {[10, 25, 50, 100, 250].map((amount) => (
                        <Button
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange('amount', amount)}
                        >
                          ${amount}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Donor Name */}
                  <div className="space-y-2">
                    <Label htmlFor="donor_name">Your Name *</Label>
                    <Input
                      id="donor_name"
                      value={formData.donor_name}
                      onChange={(e) => handleInputChange('donor_name', e.target.value)}
                      onBlur={() => handleBlur('donor_name')}
                      placeholder="John Doe"
                      className={errors.donor_name ? 'border-red-500' : ''}
                    />
                    {errors.donor_name && (
                      <p className="text-sm text-red-600">{errors.donor_name}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      onBlur={() => handleBlur('email')}
                      placeholder="john@example.com"
                      className={errors.email ? 'border-red-500' : ''}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>

                  {/* Country */}
                  <div className="space-y-2">
                    <Label htmlFor="country">Your Country *</Label>
                    <Select
                      value={formData.country}
                      onValueChange={(value) => handleInputChange('country', value)}
                    >
                      <SelectTrigger className={errors.country ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select your country" />
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

                  {/* Submit Button */}
                  <Button 
                    type="submit" 
                    className="w-full" 
                    size="lg"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      `Donate $${formData.amount.toFixed(2)}`
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {selectedProject && (
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Selected Project</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {selectedProject.image_url && (
                    <img 
                      src={selectedProject.image_url}
                      alt={selectedProject.name}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="font-semibold text-lg">{selectedProject.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedProject.description.substring(0, 100)}...
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Location:</span>
                      <span className="font-medium">{selectedProject.country}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Beneficiaries:</span>
                      <span className="font-medium">{selectedProject.beneficiaries_count}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Why Donate?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p>Your donation helps us:</p>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Empower young leaders across Africa</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Support education initiatives</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Create sustainable community projects</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}