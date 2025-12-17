import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '@/services/projectService';
import { projectImageService } from '@/services/projectImageService';
import type { ProjectImage } from '@/services/projectImageService';
import type { Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getHeroImageUrl } from '@/utils/cloudinary';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, MapPin, Users, DollarSign, Calendar } from 'lucide-react';

export function ProjectDetails() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProject(parseInt(id));
      loadImages(parseInt(id));
    }
  }, [id]);

  const loadProject = async (projectId: number) => {
    try {
      setLoading(true);
      const response = await projectService.getById(projectId);
      
      if (response.success && response.data) {
        setProject(response.data);
      } else {
        setError('Project not found');
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError('Failed to load project details');
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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Skeleton className="h-96 w-full mb-8" />
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700 mb-4">{error || 'Project not found'}</p>
            <Link to="/projects">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Projects
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
    {/* Hero Image with Title and Description Overlay */}
    {project.cloudinary_public_id && (
      <div className="relative w-full h-192 bg-gray-200">
        <img 
          src={getHeroImageUrl(project.cloudinary_public_id)} 
          alt={project.name}
          className="w-full h-full object-cover"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 text-white">
          <div className="container mx-auto px-4 py-12">
            <div className="flex items-start justify-between mb-6">
              <h1 className="text-5xl font-bold drop-shadow-lg">{project.name}</h1>
              <Badge 
                variant={project.status === 'active' ? 'default' : 'secondary'}
                className="text-base px-4 py-2"
              >
                {project.status}
              </Badge>
            </div>
            
            <p className="text-xl text-white/95 max-w-4xl whitespace-pre-wrap drop-shadow-lg leading-relaxed">
              {project.description}
            </p>
          </div>
        </div>
      </div>
    )}

      <div className="container mx-auto px-4 py-12">
        {/* Back Button */}
        <Link to="/projects" className="inline-block mb-6">
          <Button variant="ghost">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Projects
          </Button>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">

            {/* Project Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center space-y-0 pb-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mr-2" />
                  <CardTitle className="text-sm font-medium">Location</CardTitle>
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
                  <div className="text-2xl font-bold">{project.beneficiaries_count}</div>
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
                  <CardTitle className="text-sm font-medium">Started</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {new Date(project.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar - Call to Action */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Support This Project</CardTitle>
                <CardDescription>
                  Help us make a difference in {project.country}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Link to={`/donate?project=${project.id}`} className="block">
                  <Button className="w-full" size="lg">
                    Donate Now
                  </Button>
                </Link>
                <Link to="/apply" className="block">
                  <Button variant="outline" className="w-full" size="lg">
                    Join Our Team
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Project Impact */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Project Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">People Reached:</span>
                    <span className="font-semibold">{project.beneficiaries_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Budget:</span>
                    <span className="font-semibold">${project.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge variant="outline">{project.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Project Gallery - Only show for completed projects with images */}
        {project.status === 'completed' && images.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Project Gallery</CardTitle>
              <CardDescription>Photos from the completed project</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingImages ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="aspect-square rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((image) => (
                    <div key={image.id} className="group cursor-pointer">
                      <div className="overflow-hidden rounded-lg border border-gray-200 hover:border-blue-500 transition-colors">
                        <img
                          src={getHeroImageUrl(image.cloudinary_public_id)}
                          alt={image.caption || 'Project image'}
                          className="w-full aspect-square object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      {image.caption && (
                        <p className="text-sm text-gray-600 mt-2 line-clamp-2">{image.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}