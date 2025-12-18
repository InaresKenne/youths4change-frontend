import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import type { DonationFormData, PaymentAccounts } from '@/services/donationService';
import { donationService } from '@/services/donationService';
import type { Project } from '@/types';
import { contactService } from '@/services/contactService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { validationPatterns } from '@/utils/validation';
import { Loader2, CheckCircle2, AlertCircle, Upload, Copy, CreditCard, Smartphone } from 'lucide-react';
import { openCloudinaryWidget } from '@/utils/cloudinary';
import { clearCacheEntry } from '@/services/api';

export function Donate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedProjectId = searchParams.get('project');

  // Exchange rate: 1 USD = 15.5 GHS (update as needed)
  const USD_TO_GHS = 15.5;

  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [paymentAccounts, setPaymentAccounts] = useState<PaymentAccounts | null>(null);
  const [paymentStep, setPaymentStep] = useState<'details' | 'payment' | 'confirmation'>('details');
  const [uploadingProof, setUploadingProof] = useState(false);
  
  const [formData, setFormData] = useState<DonationFormData>({
    donor_name: '',
    email: '',
    amount: 0,
    project_id: 0,
    country: '',
    payment_method: 'mobile_money',
    transaction_id: '',
    payment_proof_url: '',
    currency: 'USD',
  });
  
  const [errors, setErrors] = useState<Partial<Record<keyof DonationFormData, string>>>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [donationId, setDonationId] = useState<number | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [countries, setCountries] = useState<string[]>([]);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
    loadCountries();
    loadPaymentAccounts();
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

  const loadCountries = async () => {
    try {
      const response = await contactService.getOfficeCountries();
      if (response.success && response.data) {
        setCountries(response.data);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  const loadPaymentAccounts = async () => {
    try {
      const response = await donationService.getPaymentAccounts();
      if (response.success && response.data) {
        setPaymentAccounts(response.data);
      }
    } catch (error) {
      console.error('Error loading payment accounts:', error);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleUploadProof = () => {
    setUploadingProof(true);
    openCloudinaryWidget(
      (publicId: string) => {
        setFormData(prev => ({ ...prev, payment_proof_url: publicId }));
        setUploadingProof(false);
      },
      () => setUploadingProof(false),
      false
    );
  };

  const validateField = (name: keyof DonationFormData, value: string | number | undefined): string | null => {
    switch (name) {
      case 'donor_name':
        if (!value) return 'Donor name is required';
        if (!validationPatterns.name.test(value.toString())) {
          return 'Name must be 2-50 characters, letters and spaces only';
        }
        return null;

      case 'email':
        if (!value) return 'Email is required';
        const email = value.toString().trim();
        if (!email) return 'Email is required';
        if (!validationPatterns.email.test(email)) {
          return 'Invalid email format';
        }
        return null;

      case 'amount':
        const amount = typeof value === 'string' ? parseFloat(value) : value;
        if (!amount || amount <= 0) return 'Amount is required';
        if (amount < 1) return 'Minimum donation is $1 USD';
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

      case 'transaction_id':
        if (paymentStep === 'confirmation' && !value) {
          return 'Transaction reference is required';
        }
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
    const error = validateField(field, formData[field] as string | number | undefined);
    if (error) {
      setErrors(prev => ({ ...prev, [field]: error }));
    }
  };



  const handleContinueToPayment = () => {
    // Validate first step fields
    const requiredFields: Array<keyof DonationFormData> = ['donor_name', 'email', 'amount', 'project_id', 'country'];
    const newErrors: Partial<Record<keyof DonationFormData, string>> = {};
    
    requiredFields.forEach(field => {
      const error = validateField(field, formData[field] as string | number | undefined);
      if (error) {
        newErrors[field] = error;
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setPaymentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToDetails = () => {
    setPaymentStep('details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleContinueToConfirmation = () => {
    setPaymentStep('confirmation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    // Validate transaction reference
    if (!formData.transaction_id) {
      setErrors({ transaction_id: 'Transaction reference is required' });
      return;
    }

    try {
      setLoading(true);
      console.log('Submitting donation:', formData);
      const response = await donationService.submit(formData);
      console.log('Donation response:', response);
      
      if (response.success && response.id) {
        console.log('Donation successful, ID:', response.id);
        
        // Clear donation cache so admin sees the new donation immediately
        clearCacheEntry('/api/donations');
        clearCacheEntry('/api/donations/stats');
        
        setSuccess(true);
        setDonationId(response.id);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error('Unexpected response format:', response);
        setApiError('Unexpected response from server. Please try again.');
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
        <Card className="max-w-2xl mx-auto border-blue-200 bg-blue-50">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-blue-600" />
            </div>
            <CardTitle className="text-3xl text-blue-900">Thank You for Donating!</CardTitle>
            <CardDescription className="text-lg text-blue-700">
              Your donation has been submitted successfully
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
                <span className="text-2xl font-bold text-blue-600">
                  ${formData.amount.toFixed(2)} USD
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Equivalent in Cedis:</span>
                <span>GHS {(formData.amount * USD_TO_GHS).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Project:</span>
                <span>{selectedProject?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Donor:</span>
                <span>{formData.donor_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Payment Method:</span>
                <span className="capitalize">{formData.payment_method.replace('_', ' ')}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold">Transaction Ref:</span>
                <span className="font-mono text-sm">{formData.transaction_id}</span>
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Payment Under Verification</AlertTitle>
              <AlertDescription>
                We'll verify your payment within 24 hours and send you a confirmation email 
                at <strong>{formData.email}</strong>. Thank you for supporting Youths4Change!
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
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
                  <AlertTitle>Manual Payment Verification</AlertTitle>
                  <AlertDescription>
                    After making your payment via Mobile Money or Bank Transfer, we'll verify it within 24 hours.
                  </AlertDescription>
                </Alert>

                {apiError && (
                  <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{apiError}</AlertDescription>
                  </Alert>
                )}

                {/* Step 1: Donation Details */}
                {paymentStep === 'details' && (
                  <div className="space-y-6">
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

                    <div className="space-y-2">
                      <Label htmlFor="amount">Donation Amount (USD) *</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          min="1"
                          value={formData.amount || ''}
                          onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                          onBlur={() => handleBlur('amount')}
                          placeholder="10.00"
                          className={`pl-14 ${errors.amount ? 'border-red-500' : ''}`}
                        />
                      </div>
                      {errors.amount && (
                        <p className="text-sm text-red-600">{errors.amount}</p>
                      )}
                      {formData.amount > 0 && (
                        <p className="text-sm text-blue-600 font-medium">
                          ≈ GHS {(formData.amount * USD_TO_GHS).toFixed(2)} (Send this amount in cedis)
                        </p>
                      )}
                      <p className="text-sm text-gray-500">Minimum donation: $1 USD</p>

                      <div className="flex gap-2 flex-wrap">
                        {[5, 10, 25, 50, 100].map((amount) => (
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
                          {countries.map((country) => (
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

                    <Button 
                      onClick={handleContinueToPayment}
                      className="w-full" 
                      size="lg"
                    >
                      Continue to Payment
                    </Button>
                  </div>
                )}

                {/* Step 2: Payment Instructions */}
                {paymentStep === 'payment' && paymentAccounts && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" onClick={handleBackToDetails}>
                        ← Back
                      </Button>
                      <span className="text-sm text-gray-500">Step 2 of 3</span>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Payment Instructions</AlertTitle>
                      <AlertDescription>
                        Send <strong className="text-blue-600">GHS {(formData.amount * USD_TO_GHS).toFixed(2)}</strong> (equivalent to ${formData.amount.toFixed(2)} USD) using your preferred payment method below.
                      </AlertDescription>
                    </Alert>

                    <Tabs value={formData.payment_method} onValueChange={(value) => handleInputChange('payment_method', value as 'mobile_money' | 'bank_transfer')}>
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="mobile_money">
                          <Smartphone className="h-4 w-4 mr-2" />
                          Mobile Money
                        </TabsTrigger>
                        <TabsTrigger value="bank_transfer">
                          <CreditCard className="h-4 w-4 mr-2" />
                          Bank Transfer
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="mobile_money" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Ghana Mobile Money</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">Phone Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{paymentAccounts.mobile_money.ghana.number}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(paymentAccounts.mobile_money.ghana.number, 'momo_ghana')}
                                >
                                  {copiedField === 'momo_ghana' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-medium">Name:</span>
                              <span>{paymentAccounts.mobile_money.ghana.name}</span>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Cameroon Mobile Money</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">Phone Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{paymentAccounts.mobile_money.cameroon.number}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(paymentAccounts.mobile_money.cameroon.number, 'momo_cameroon')}
                                >
                                  {copiedField === 'momo_cameroon' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-medium">Name:</span>
                              <span>{paymentAccounts.mobile_money.cameroon.name}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>

                      <TabsContent value="bank_transfer" className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">Bank Account Details</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">Account Name:</span>
                              <span>{paymentAccounts.bank_account.account_name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">Bank Name:</span>
                              <span>{paymentAccounts.bank_account.name}</span>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">Account Number:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{paymentAccounts.bank_account.account_number}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(paymentAccounts.bank_account.account_number, 'bank_account')}
                                >
                                  {copiedField === 'bank_account' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2 border-b">
                              <span className="text-sm font-medium">SWIFT Code:</span>
                              <div className="flex items-center gap-2">
                                <span className="font-mono">{paymentAccounts.bank_account.swift_code}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(paymentAccounts.bank_account.swift_code, 'swift')}
                                >
                                  {copiedField === 'swift' ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                            <div className="flex justify-between items-center py-2">
                              <span className="text-sm font-medium">Bank Address:</span>
                              <span className="text-right">{paymentAccounts.bank_account.address}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </TabsContent>
                    </Tabs>

                    <Button 
                      onClick={handleContinueToConfirmation}
                      className="w-full" 
                      size="lg"
                    >
                      I've Made the Payment
                    </Button>
                  </div>
                )}

                {/* Step 3: Transaction Confirmation */}
                {paymentStep === 'confirmation' && (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Button type="button" variant="ghost" onClick={() => setPaymentStep('payment')}>
                        ← Back
                      </Button>
                      <span className="text-sm text-gray-500">Step 3 of 3</span>
                    </div>

                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Confirm Your Payment</AlertTitle>
                      <AlertDescription>
                        Enter your transaction reference and optionally upload proof of payment.
                      </AlertDescription>
                    </Alert>

                    <div className="space-y-2">
                      <Label htmlFor="transaction_id">Transaction Reference / ID *</Label>
                      <Input
                        id="transaction_id"
                        value={formData.transaction_id}
                        onChange={(e) => handleInputChange('transaction_id', e.target.value)}
                        placeholder="e.g., MTN123456789 or Bank Ref: ABC123"
                        className={errors.transaction_id ? 'border-red-500' : ''}
                      />
                      {errors.transaction_id && (
                        <p className="text-sm text-red-600">{errors.transaction_id}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Enter the transaction ID from your mobile money receipt or bank transfer confirmation
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Payment Proof (Optional)</Label>
                      <div className="flex items-center gap-3">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleUploadProof}
                          disabled={uploadingProof}
                        >
                          {uploadingProof ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Upload className="mr-2 h-4 w-4" />
                              Upload Screenshot
                            </>
                          )}
                        </Button>
                        {formData.payment_proof_url && (
                          <span className="text-sm text-green-600 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Proof uploaded
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Upload a screenshot of your payment confirmation (optional but helps with faster verification)
                      </p>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <h4 className="font-semibold">Donation Summary</h4>
                      <div className="flex justify-between text-sm">
                        <span>Amount:</span>
                        <span className="font-semibold">${formData.amount.toFixed(2)} USD</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Send in Cedis:</span>
                        <span className="font-semibold text-blue-600">GHS {(formData.amount * USD_TO_GHS).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Project:</span>
                        <span>{selectedProject?.name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Payment Method:</span>
                        <span className="capitalize">{formData.payment_method.replace('_', ' ')}</span>
                      </div>
                    </div>

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
                        'Submit Donation'
                      )}
                    </Button>
                  </form>
                )}
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
                  {selectedProject.cloudinary_public_id && (
                    <img 
                      src={`https://res.cloudinary.com/dsrca4ug2/image/upload/w_400,h_300,c_fill,q_auto,f_auto/${selectedProject.cloudinary_public_id}`}
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