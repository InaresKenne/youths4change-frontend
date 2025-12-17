import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { adminProjectService } from '@/services/adminProjectService';
import { projectImageService } from '@/services/projectImageService';
import type { ProjectImage } from '@/services/projectImageService';
import type { Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MultiImageUpload, type MultiImageUploadItem } from '@/components/ui/multi-image-upload';
import { getFullImageUrl } from '@/utils/cloudinary';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  MapPin, 
  Users, 
  DollarSign, 
  Calendar,
  ExternalLink,
  Plus,
  X,
  Image as ImageIcon,
  Loader2,
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

export function ProjectView() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Project images state
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [addImageDialogOpen, setAddImageDialogOpen] = useState(false);
  const [newImages, setNewImages] = useState<MultiImageUploadItem[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    if (id) {
      loadProject(parseInt(id));
      loadImages(parseInt(id));
    }
  }, [id]);

  const loadProject = async (projectId: number) => {
    try {
      const response = await adminProjectService.getById(projectId);
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const loadImages = async (projectId: number) => {
    try {
      setLoadingImages(true);
      const response = await projectImageService.getImages(projectId);
      if (response.success && response.data) {
        setImages(response.data);
      }
    } catch (err) {
      console.error('Error loading images:', err);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleAddImages = async () => {
    if (!project || newImages.length === 0) return;
    
    try {
      setUploadingImages(true);
      
      // Upload all images in parallel
      const uploadPromises = newImages.map(img => 
        projectImageService.addImage(project.id, {
          cloudinary_public_id: img.cloudinary_public_id,
          caption: img.caption || undefined,
        })
      );
      
      await Promise.all(uploadPromises);
      
      setAddImageDialogOpen(false);
      setNewImages([]);
      loadImages(project.id);
    } catch (err) {
      console.error('Error adding images:', err);
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!project) return;
    
    try {
      const response = await projectImageService.deleteImage(project.id, imageId);
      if (response.success) {
        loadImages(project.id);
      }
    } catch (err) {
      console.error('Error deleting image:', err);
    }
  };

  const handleDelete = async () => {
    if (!project) return;
    
    try {
      setDeleting(true);
      const response = await adminProjectService.delete(project.id);
      if (response.success) {
        navigate('/admin/projects');
      }
    } catch (err) {
      console.error('Error deleting project:', err);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'deleted':
        return <Badge variant="destructive">Deleted</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/admin/projects')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Projects
        </Button>
        <Alert variant="destructive">
          <AlertDescription>{error || 'Project not found'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/projects')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {getStatusBadge(project.status)}
            </div>
            <p className="text-gray-600">Project ID: #{project.id}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Link to={`/projects/${project.id}`} target="_blank">
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              View Public
            </Button>
          </Link>
          <Link to={`/admin/projects/${project.id}/edit`}>
            <Button variant="outline">
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          {project.status !== 'deleted' && (
            <Button 
              variant="destructive" 
              onClick={() => setDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          )}
        </div>
      </div>

      {/* Project Image */}
        {project.cloudinary_public_id && (
          <Card>
            <CardContent className="p-0">
              <img 
                src={getFullImageUrl(project.cloudinary_public_id)} 
                alt={project.name}
                className="w-full h-64 object-cover rounded-lg"
              />
            </CardContent>
          </Card>
        )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Country</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.country}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Users className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Beneficiaries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.beneficiaries_count.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <DollarSign className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${project.budget.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
            <CardTitle className="text-sm font-medium">Created</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(project.created_at).toLocaleDateString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {project.description}
          </p>
        </CardContent>
      </Card>

      {/* Project Images Gallery */}
      {project.status === 'completed' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Project Gallery</CardTitle>
                <CardDescription>Upload images to showcase the completed project</CardDescription>
              </div>
              <Button onClick={() => setAddImageDialogOpen(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Image
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loadingImages ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="aspect-square rounded-lg" />
                ))}
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <ImageIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No images uploaded yet</p>
                <Button onClick={() => setAddImageDialogOpen(true)} variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Image
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={getFullImageUrl(image.cloudinary_public_id)}
                      alt={image.caption || 'Project image'}
                      className="w-full aspect-square object-cover rounded-lg border"
                    />
                    {image.caption && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{image.caption}</p>
                    )}
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleDeleteImage(image.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Meta Information */}
      <Card>
        <CardHeader>
          <CardTitle>Meta Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Created At:</span>
              <span className="ml-2 font-medium">
                {new Date(project.created_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Updated At:</span>
              <span className="ml-2 font-medium">
                {new Date(project.updated_at).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2">{getStatusBadge(project.status)}</span>
            </div>
            {project.cloudinary_public_id && (
              <div>
                <span className="text-gray-500">Image Public ID:</span>
                <span className="ml-2 font-mono text-sm">{project.cloudinary_public_id}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add Images Dialog */}
      <Dialog open={addImageDialogOpen} onOpenChange={setAddImageDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Project Images</DialogTitle>
            <DialogDescription>
              Upload multiple images to showcase this completed project. You can add captions to each image.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <MultiImageUpload
              onImagesChange={(images) => {
                console.log('Images changed in ProjectView:', images.length);
                setNewImages(images);
              }}
              maxImages={20}
              disabled={uploadingImages}
            />
          </div>
          
          {/* Debug info */}
          {newImages.length > 0 && (
            <div className="text-sm text-gray-600">
              {newImages.length} image{newImages.length !== 1 ? 's' : ''} ready to upload
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddImageDialogOpen(false);
                setNewImages([]);
              }}
              disabled={uploadingImages}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddImages}
              disabled={newImages.length === 0 || uploadingImages}
            >
              {uploadingImages ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading {newImages.length} image{newImages.length !== 1 ? 's' : ''}...
                </>
              ) : (
                `Add ${newImages.length} Image${newImages.length !== 1 ? 's' : ''}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{project.name}"? 
              This action will mark the project as deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}