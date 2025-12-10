import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { projectService } from '@/services/projectService';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadProject(parseInt(id));
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
    {/* Hero Image */}
    {project.cloudinary_public_id && (
      <div className="w-full h-96 bg-gray-200">
        <img 
          src={getHeroImageUrl(project.cloudinary_public_id)} 
          alt={project.name}
          className="w-full h-full object-cover"
        />
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
            <div className="flex items-start justify-between mb-4">
              <h1 className="text-4xl font-bold">{project.name}</h1>
              <Badge variant={project.status === 'active' ? 'default' : 'secondary'}>
                {project.status}
              </Badge>
            </div>

            <p className="text-lg text-gray-600 mb-8 whitespace-pre-wrap">
              {project.description}
            </p>

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
      </div>
    </div>
  );
}