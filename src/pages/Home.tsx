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

  return (
    <div>
    {/* Hero Section */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        {loading ? (
          <>
            <Skeleton className="h-14 w-3/4 mx-auto mb-4 bg-white/20" />
            <Skeleton className="h-6 w-2/3 mx-auto mb-8 bg-white/20" />
          </>
        ) : (
          <>
            <h1 className="text-5xl font-bold mb-4">
              {settings?.hero_heading || 'Empowering African Youth'}
            </h1>
            <p className="text-xl mb-8">
              {settings?.hero_description || 'Creating positive change across eight countries'}
            </p>
          </>
        )}
        <div className="space-x-4">
          <Link to="/projects">
            <Button size="lg" variant="secondary">
              View Projects
            </Button>
          </Link>
          <Link to="/apply">
            <Button size="lg" variant="outline" className="bg-transparent hover:bg-white/10">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {[
          { label: 'Countries', value: stats.countries_count },
          { label: 'Active Projects', value: stats.active_projects },
          { label: 'Young Leaders', value: stats.approved_applications },
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
    </div>
  );
}