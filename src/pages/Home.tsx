import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { analyticsService } from '@/services/analyticsService';
import type {OverviewStats } from '@/services/analyticsService';
import { settingsService } from '@/services/settingsService';
import type { SiteSettings, PageContent } from '@/types';


export function Home() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, settingsRes, contentRes] = await Promise.all([
        analyticsService.getOverview(),
        settingsService.getSettings(),
        settingsService.getPageContent('home'),
      ]);
      
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
      
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      
      if (contentRes.success && contentRes.data) {
        setContent(contentRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Extract video ID from YouTube or Vimeo URL
  const getVideoEmbedUrl = (url: string): string | null => {
    if (!url) return null;
    
    // YouTube patterns
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1&mute=1&loop=1&playlist=${youtubeMatch[1]}`;
    }
    
    // Vimeo pattern
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1&loop=1&muted=1&background=1`;
    }
    
    return null;
  };

  const videoEmbedUrl = settings?.hero_video_url ? getVideoEmbedUrl(settings.hero_video_url) : null;

  return (
    <div>
    {/* Hero Section */}
    <div className="relative bg-gradient-to-r from-blue-600 to-blue-800 text-white py-32 md:py-40 lg:py-48 overflow-hidden min-h-[600px] md:min-h-[700px]">
      {/* Background Video */}
      {videoEmbedUrl && (
        <div className="absolute inset-0 w-full h-full z-0">
          <iframe
            src={videoEmbedUrl}
            className="w-full h-full"
            style={{ 
              minHeight: '100%', 
              minWidth: '177.77vh',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            allow="autoplay; fullscreen; picture-in-picture"
            frameBorder="0"
            title="Hero background video"
          />

        </div>
      )}
      
      <div className="container mx-auto px-4 text-center relative z-10 flex flex-col justify-center h-full">
        {loading ? (
          <>
            <Skeleton className="h-14 w-3/4 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-8 bg-white/20" />
          </>
        ) : (
          <>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 drop-shadow-lg">
              {settings?.hero_heading || 'Empowering African Youth'}
            </h1>
            <p className="text-xl md:text-2xl mb-10 drop-shadow-lg max-w-3xl mx-auto">
              {settings?.hero_description || 'Creating positive change across eight countries'}
            </p>
          </>
        )}
        <div className="space-x-4">
          <Link to="/projects">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              View Projects
            </Button>
          </Link>
          <Link to="/apply">
            <Button size="lg" variant="outline" className="bg-transparent hover:bg-white/10 border-white text-lg px-8 py-6">
              Join Us
            </Button>
          </Link>
        </div>
      </div>
    </div>

      {/* Stats Section */}
      <div className="py-16 bg-gray-50">
  <div className="container mx-auto px-4">
    {loading ? (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-12 w-20 mx-auto" />
              <Skeleton className="h-4 w-24 mx-auto mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    ) : stats ? (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Countries', value: stats.countries_count },
          { label: 'Active Projects', value: stats.active_projects },
          { label: 'Young Leaders', value: stats.total_team_members + stats.approved_applications },
          { label: 'Lives Impacted', value: stats.total_beneficiaries },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardHeader>
              <CardTitle className="text-4xl text-blue-600 text-center">
                {stat.value.toLocaleString()}
              </CardTitle>
              <CardDescription className="text-center text-lg">
                {stat.label}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    ) : (
      <div className="text-center text-gray-600">
        Unable to load statistics
      </div>
    )}
  </div>
</div>

  {/* Mission Section */}
  <div className="py-16">
    <div className="container mx-auto px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl text-center">Our Mission</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : (
            <p className="text-gray-600 text-lg text-center">
              {content?.mission_preview || settings?.mission_statement || 
              'Youths4Change Initiative is a youth-led nonprofit organization dedicated to empowering young people across eight African countries.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  </div>

  {/* Get Involved Section */}
  <div className="py-16 bg-gray-50">
    <div className="container mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-12">Get Involved</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Volunteer */}
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-2xl">Volunteer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Join our team and contribute your skills to make a difference
            </p>
            <Link to="/apply">
              <Button className="w-full" variant="outline">
                Learn More
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Partner */}
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-2xl">Partner With Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Collaborate on projects and initiatives across Africa
            </p>
            <Link to="/contact">
              <Button className="w-full" variant="outline">
                Partnership Info
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Media */}
        <Card className="hover:shadow-lg transition">
          <CardHeader>
            <CardTitle className="text-2xl">Media Inquiries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">
              Press and media contacts for interviews and features
            </p>
            <Link to="/contact">
              <Button className="w-full" variant="outline">
                Media Kit
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
    </div>
  );
}