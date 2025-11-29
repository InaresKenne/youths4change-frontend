import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApplicationService } from '@/services/adminApplicationService';
import type { Application } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
} from 'lucide-react';
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

export function ApplicationView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approved' | 'rejected'>('approved');
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    if (id) {
      loadApplication(parseInt(id));
    }
  }, [id]);

  const loadApplication = async (applicationId: number) => {
    try {
      const response = await adminApplicationService.getById(applicationId);
      if (response.success && response.data) {
        setApplication(response.data);
      } else {
        setError('Application not found');
      }
    } catch (err) {
      console.error('Error loading application:', err);
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async () => {
    if (!application) return;
    
    try {
      setReviewing(true);
      const response = await adminApplicationService.review(application.id, reviewAction);
      
      if (response.success) {
        setApplication({
          ...application,
          status: reviewAction,
          reviewed_at: new Date().toISOString(),
        });
      }
    } catch (err) {
      console.error('Error reviewing application:', err);
    } finally {
      setReviewing(false);
      setReviewDialogOpen(false);
    }
  };

  const openReviewDialog = (action: 'approved' | 'rejected') => {
    setReviewAction(action);
    setReviewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 text-base px-4 py-1">
            <Clock className="mr-2 h-4 w-4" />
            Pending Review
          </Badge>
        );
      case 'approved':
        return (
          <Badge className="bg-green-100 text-green-800 text-base px-4 py-1">
            <CheckCircle className="mr-2 h-4 w-4" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge className="bg-red-100 text-red-800 text-base px-4 py-1">
            <XCircle className="mr-2 h-4 w-4" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Count words in motivation
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/applications')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Applications
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Application not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/applications')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{application.full_name}</h1>
              {getStatusBadge(application.status)}
            </div>
            <p className="text-gray-600">Application ID: #{application.id}</p>
          </div>
        </div>
        
        {application.status === 'pending' && (
          <div className="flex gap-2">
            <Button 
              className="bg-green-600 hover:bg-green-700"
              onClick={() => openReviewDialog('approved')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Approve
            </Button>
            <Button 
              variant="destructive"
              onClick={() => openReviewDialog('rejected')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Motivation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Motivation Statement
              </CardTitle>
              <CardDescription>
                {countWords(application.motivation)} words
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4 border">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {application.motivation}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Application Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Calendar className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Application Submitted</p>
                    <p className="text-sm text-gray-600">
                      {new Date(application.applied_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                {application.reviewed_at && (
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                      application.status === 'approved' 
                        ? 'bg-green-100' 
                        : 'bg-red-100'
                    }`}>
                      {application.status === 'approved' 
                        ? <CheckCircle className="h-5 w-5 text-green-600" />
                        : <XCircle className="h-5 w-5 text-red-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium">
                        Application {application.status === 'approved' ? 'Approved' : 'Rejected'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {new Date(application.reviewed_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
                
                {application.status === 'pending' && (
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">Awaiting Review</p>
                      <p className="text-sm text-gray-600">
                        Pending for {Math.floor((Date.now() - new Date(application.applied_at).getTime()) / (1000 * 60 * 60 * 24))} days
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Contact Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Applicant Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Full Name</p>
                <p className="font-medium text-lg">{application.full_name}</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <a 
                    href={`mailto:${application.email}`}
                    className="text-blue-600 hover:underline"
                  >
                    {application.email}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <a 
                    href={`tel:${application.phone}`}
                    className="text-blue-600 hover:underline"
                  >
                    {application.phone}
                  </a>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  <p className="font-medium">{application.country}</p>
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
                onClick={() => window.location.href = `mailto:${application.email}`}
              >
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.location.href = `tel:${application.phone}`}
              >
                <Phone className="mr-2 h-4 w-4" />
                Call Applicant
              </Button>
            </CardContent>
          </Card>

          {/* Status Info */}
          <Card className={
            application.status === 'pending' 
              ? 'border-yellow-200 bg-yellow-50'
              : application.status === 'approved'
                ? 'border-green-200 bg-green-50'
                : 'border-red-200 bg-red-50'
          }>
            <CardContent className="pt-6">
              <div className="text-center">
                {application.status === 'pending' && (
                  <>
                    <Clock className="h-12 w-12 mx-auto mb-2 text-yellow-600" />
                    <p className="font-semibold text-yellow-800">Pending Review</p>
                    <p className="text-sm text-yellow-700 mt-1">
                      This application is waiting for your decision
                    </p>
                  </>
                )}
                {application.status === 'approved' && (
                  <>
                    <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p className="font-semibold text-green-800">Approved</p>
                    <p className="text-sm text-green-700 mt-1">
                      Applicant has been accepted
                    </p>
                  </>
                )}
                {application.status === 'rejected' && (
                  <>
                    <XCircle className="h-12 w-12 mx-auto mb-2 text-red-600" />
                    <p className="font-semibold text-red-800">Rejected</p>
                    <p className="text-sm text-red-700 mt-1">
                      Application was not successful
                    </p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Review Confirmation Dialog */}
      <AlertDialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {reviewAction === 'approved' ? 'Approve' : 'Reject'} Application
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to {reviewAction === 'approved' ? 'approve' : 'reject'} this 
              application from <strong>{application.full_name}</strong>?
              {reviewAction === 'approved' 
                ? ' They will be notified of their acceptance.'
                : ' They will be notified that their application was not successful.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={reviewing}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReview}
              disabled={reviewing}
              className={reviewAction === 'approved' 
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-red-600 hover:bg-red-700'
              }
            >
              {reviewing 
                ? 'Processing...' 
                : reviewAction === 'approved' ? 'Approve' : 'Reject'
              }
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}