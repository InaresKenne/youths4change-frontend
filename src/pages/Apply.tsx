import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import  type {ApplicationFormData } from '@/services/applicationService';
import  { applicationService } from '@/services/applicationService';
import { COUNTRIES } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { validationPatterns, countWords } from '@/utils/validation';
import { Loader2, CheckCircle2 } from 'lucide-react';

export function Apply() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ApplicationFormData>({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    motivation: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const wordCount = countWords(formData.motivation);

  const validateField = (name: keyof ApplicationFormData, value: string): string | null => {
    switch (name) {
      case 'full_name':
        if (!value) return 'Full name is required';
        if (!validationPatterns.name.test(value)) {
          return 'Name must be 3-50 characters, letters and spaces only';
        }
        return null;

      case 'email':
        if (!value) return 'Email is required';
        if (!validationPatterns.email.test(value)) {
          return 'Invalid email format';
        }
        return null;

      case 'phone':
        if (!value) return 'Phone number is required';
        if (!validationPatterns.phone.test(value)) {
          return 'Phone must be 10-15 digits, can start with +';
        }
        return null;

      case 'country':
        if (!value) return 'Please select a country';
        return null;

      case 'motivation':
        if (!value) return 'Motivation is required';
        const words = countWords(value);
        if (words < 100) return `Motivation must be at least 100 words (current: ${words})`;
        if (words > 500) return `Motivation must not exceed 500 words (current: ${words})`;
        return null;

      default:
        return null;
    }
  };

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
    setApiError(null);
  };

  const handleBlur = (field: keyof ApplicationFormData) => {
    const error = validateField(field, formData[field]);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof ApplicationFormData, string>> = {};
    
    (Object.keys(formData) as Array<keyof ApplicationFormData>).forEach(key => {
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
      const response = await applicationService.submit(formData);
      
      if (response.success) {
        setSuccess(true);
        // Scroll to top to show success message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error('Error submitting application:', err);
      setApiError(
        err.response?.data?.error || 'Failed to submit application. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto border-green-200 bg-green-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl text-green-900">Application Submitted!</CardTitle>
            <CardDescription className="text-lg text-green-700">
              Thank you for your interest in joining Youths4Change
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-700">
              We've received your application and will review it within 7 business days. 
              You'll receive an email at <strong>{formData.email}</strong> with our decision.
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Button onClick={() => navigate('/')}>
                Return Home
              </Button>
              <Button variant="outline" onClick={() => navigate('/projects')}>
                View Projects
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Join Youths4Change</CardTitle>
            <CardDescription className="text-lg">
              Apply to become part of our team and help create positive change across Africa
            </CardDescription>
          </CardHeader>
          <CardContent>
            {apiError && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  onBlur={() => handleBlur('full_name')}
                  placeholder="John Doe"
                  className={errors.full_name ? 'border-red-500' : ''}
                />
                {errors.full_name && (
                  <p className="text-sm text-red-600">{errors.full_name}</p>
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

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  onBlur={() => handleBlur('phone')}
                  placeholder="+233244123456"
                  className={errors.phone ? 'border-red-500' : ''}
                />
                {errors.phone && (
                  <p className="text-sm text-red-600">{errors.phone}</p>
                )}
                <p className="text-sm text-gray-500">
                  Include country code (e.g., +233 for Ghana)
                </p>
              </div>

              {/* Country */}
              <div className="space-y-2">
                <Label htmlFor="country">Country *</Label>
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

              {/* Motivation */}
              <div className="space-y-2">
                <Label htmlFor="motivation">
                  Why do you want to join Youths4Change? *
                </Label>
                <Textarea
                  id="motivation"
                  value={formData.motivation}
                  onChange={(e) => handleInputChange('motivation', e.target.value)}
                  onBlur={() => handleBlur('motivation')}
                  placeholder="Tell us about your passion for youth empowerment and community development..."
                  className={`min-h-[200px] ${errors.motivation ? 'border-red-500' : ''}`}
                />
                <div className="flex justify-between text-sm">
                  <span className={wordCount < 100 || wordCount > 500 ? 'text-red-600' : 'text-gray-500'}>
                    Word count: {wordCount} / 100-500
                  </span>
                </div>
                {errors.motivation && (
                  <p className="text-sm text-red-600">{errors.motivation}</p>
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
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </Button>

              <p className="text-sm text-gray-500 text-center">
                By submitting this application, you agree to be contacted by Youths4Change 
                regarding your application and opportunities to get involved.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}