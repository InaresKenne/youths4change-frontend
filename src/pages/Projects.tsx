import { useState, useEffect } from 'react';
import api from '@/services/api';
import type { Project, ApiResponse } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';
import { getCardImageUrl } from '@/utils/cloudinary';


export function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<Project[]>>('/api/projects');
      
      if (response.data.success && response.data.data) {
        setProjects(response.data.data);
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Make sure Flask backend is running.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 text-center">Our Projects</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8 text-center">Our Projects</h1>
      
      {projects.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center text-gray-600">
            No projects found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-xl transition-shadow">
              {project.cloudinary_public_id && (
                <img 
                  src={getCardImageUrl(project.cloudinary_public_id)} 
                  alt={project.name}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              )}
              
 
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{project.name}</CardTitle>
                  <Badge variant="secondary">{project.status}</Badge>
                </div>
                <CardDescription className="line-clamp-3">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>📍 {project.country}</span>
                  <span>👥 {project.beneficiaries_count}</span>
                </div>
              </CardContent>
              
             <CardFooter>
                <Link to={`/projects/${project.id}`} className="block w-full">
                 <Button className="w-full">Learn More</Button>
                </Link>
            </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}