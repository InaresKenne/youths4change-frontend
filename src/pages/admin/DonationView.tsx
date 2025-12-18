import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import type { DonationWithProject } from '@/services/adminDonationService';
import { adminDonationService} from '@/services/adminDonationService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  ArrowLeft, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  FolderKanban,
  User,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  Image as ImageIcon,
  Loader2,
  Smartphone,
  CreditCard,
} from 'lucide-react';

export function DonationView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [donation, setDonation] = useState<DonationWithProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDonation(parseInt(id));
    }
  }, [id]);

  const loadDonation = async (donationId: number) => {
    try {
      const response = await adminDonationService.getById(donationId);
      if (response.success && response.data) {
        setDonation(response.data);
      } else {
        setError('Donation not found');
      }
    } catch (err) {
      console.error('Error loading donation:', err);
      setError('Failed to load donation');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!donation) return;
    
    try {
      setVerifying(true);
      await adminDonationService.verify(donation.id);
      setSuccessMessage('Payment verified successfully!');
      await loadDonation(donation.id);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error verifying donation:', err);
      setError('Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  const handleReject = async () => {
    if (!donation || !rejectReason.trim()) return;
    
    try {
      setRejecting(true);
      await adminDonationService.reject(donation.id, rejectReason);
      setSuccessMessage('Payment rejected');
      setShowRejectDialog(false);
      setRejectReason('');
      await loadDonation(donation.id);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error rejecting donation:', err);
      setError('Failed to reject payment');
    } finally {
      setRejecting(false);
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <Badge className="bg-green-100 text-green-800 text-base px-4 py-1 hover:bg-green-100">
            <CheckCircle className="mr-2 h-4 w-4" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 text-base px-4 py-1 hover:bg-yellow-100">
            <Clock className="mr-2 h-4 w-4" />
            Pending Verification
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 text-base px-4 py-1 hover:bg-red-100">
            <XCircle className="mr-2 h-4 w-4" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-80" />
        </div>
      </div>
    );
  }

  if (error || !donation) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/donations')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Donations
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Donation not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-800">Success</AlertTitle>
          <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/donations')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">
                {donation.currency || 'GHS'} {donation.amount.toLocaleString()}
              </h1>
              {getPaymentStatusBadge(donation.payment_status || 'completed')}
            </div>
            <p className="text-gray-600">Donation ID: #{donation.id}</p>
          </div>
        </div>

        {/* Action Buttons */}
        {donation.payment_status === 'pending' && (
          <div className="flex gap-2">
            <Button
              onClick={handleVerify}
              disabled={verifying}
              className="bg-green-600 hover:bg-green-700"
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Verify Payment
                </>
              )}
            </Button>
            <Button
              onClick={() => setShowRejectDialog(true)}
              variant="destructive"
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </div>

      {/* Reject Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this payment. The donor will be notified.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="reason">Rejection Reason *</Label>
            <Textarea
              id="reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g., Payment not received, Invalid transaction reference..."
              rows={4}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setRejectReason('')}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejecting}
              className="bg-red-600 hover:bg-red-700"
            >
              {rejecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                'Reject Payment'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Donation Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Donation Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Amount</p>
                    <p className="text-3xl font-bold text-green-600">
                      {donation.currency || 'GHS'} {donation.amount.toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Status</p>
                    {getPaymentStatusBadge(donation.payment_status || 'completed')}
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Payment Method</p>
                    <p className="font-medium flex items-center gap-2 capitalize">
                      {donation.payment_method === 'mobile_money' ? (
                        <Smartphone className="h-4 w-4 text-gray-400" />
                      ) : (
                        <CreditCard className="h-4 w-4 text-gray-400" />
                      )}
                      {donation.payment_method?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Donation Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      {new Date(donation.donation_date).toLocaleString()}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Country</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {donation.country}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-1">Transaction Reference</p>
                    <p className="font-medium font-mono text-sm">
                      {donation.transaction_id || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verification Info */}
              {donation.verified_at && (
                <div className="mt-6 pt-6 border-t space-y-2">
                  <p className="text-sm text-gray-500">Verification Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Verified By:</span>{' '}
                      <span className="font-medium">{donation.verified_by_username || 'Admin'}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Verified At:</span>{' '}
                      <span className="font-medium">
                        {new Date(donation.verified_at).toLocaleString()}
                      </span>
                    </div>
                    {donation.verification_notes && (
                      <div className="md:col-span-2">
                        <span className="text-gray-500">Notes:</span>{' '}
                        <span className="font-medium">{donation.verification_notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Proof */}
          {donation.payment_proof_url && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-blue-600" />
                  Payment Proof
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-lg overflow-hidden border">
                  <img
                    src={`https://res.cloudinary.com/dsrca4ug2/image/upload/w_800,h_600,c_fit,q_auto,f_auto/${donation.payment_proof_url}`}
                    alt="Payment proof"
                    className="w-full h-auto"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Screenshot uploaded by donor as payment proof
                </p>
              </CardContent>
            </Card>
          )}

          {/* Project Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-purple-600" />
                Project Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Donated To</p>
                  <p className="text-xl font-semibold">
                    {donation.project_name || `Project #${donation.project_id}`}
                  </p>
                </div>
                <Link to={`/admin/projects/${donation.project_id}`}>
                  <Button variant="outline">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    View Project
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Donation Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Donation Received</p>
                    <p className="text-sm text-gray-600">
                      {new Date(donation.donation_date).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {donation.status === 'completed' && (
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Payment Completed</p>
                      <p className="text-sm text-gray-600">
                        Donation processed successfully
                      </p>
                    </div>
                  </div>
                )}
                
                {donation.status === 'pending' && (
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Processing Payment</p>
                      <p className="text-sm text-gray-600">
                        Payment is being processed
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Donor Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Donor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Donor Name</p>
                <p className="font-medium text-lg">{donation.donor_name}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a 
                    href={`mailto:${donation.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {donation.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{donation.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = `mailto:${donation.email}?subject=Thank you for your donation!`}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Thank You Email
              </Button>
              <Link to={`/admin/projects/${donation.project_id}`} className="block">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <FolderKanban className="mr-2 h-4 w-4" />
                  View Project
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Amount Highlight */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-6">
              <div className="text-center">
                <DollarSign className="h-12 w-12 mx-auto mb-2 text-green-600" />
                <p className="text-3xl font-bold text-green-700">
                  ${donation.amount.toLocaleString()}
                </p>
                <p className="text-sm text-green-600 mt-1">
                  Thank you for this generous donation!
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}