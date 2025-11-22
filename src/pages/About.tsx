import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Heart, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { analyticsService} from '@/services/analyticsService';
import type {OverviewStats, CountryStats } from '@/services/analyticsService';
import { Skeleton } from '@/components/ui/skeleton';
import { settingsService } from '@/services/settingsService';
import type { SiteSettings, PageContent, CoreValue, TeamRole } from '@/types';

// Icon mapping for core values
const iconMap: Record<string, any> = {
  Heart,
  Users,
  Target,
  Globe,
};


export function About() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [content, setContent] = useState<PageContent | null>(null);
  const [coreValues, setCoreValues] = useState<CoreValue[]>([]);
  const [teamRoles, setTeamRoles] = useState<TeamRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, countryRes, settingsRes, contentRes, valuesRes, rolesRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getProjectsByCountry(),
        settingsService.getSettings(),
        settingsService.getPageContent('about'),
        settingsService.getCoreValues(),
        settingsService.getTeamRoles(),
      ]);
      
      if (overviewRes.success && overviewRes.data) {
        setStats(overviewRes.data);
      }
      
      if (countryRes.success && countryRes.data) {
        setCountryStats(countryRes.data);
      }
      
      if (settingsRes.success && settingsRes.data) {
        setSettings(settingsRes.data);
      }
      
      if (contentRes.success && contentRes.data) {
        setContent(contentRes.data);
      }
      
      if (valuesRes.success && valuesRes.data) {
        setCoreValues(valuesRes.data);
      }
      
      if (rolesRes.success && rolesRes.data) {
        setTeamRoles(rolesRes.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };


  const values = [
    {
      icon: Heart,
      title: 'Empowerment',
      description: 'We believe in empowering young people to become leaders and change-makers in their communities.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building strong, supportive communities where young people can thrive and grow together.',
    },
    {
      icon: Target,
      title: 'Impact',
      description: 'Creating measurable, sustainable impact through strategic projects and initiatives.',
    },
    {
      icon: Globe,
      title: 'Pan-African',
      description: 'Fostering unity and collaboration across eight African countries.',
    },
  ];

  const countries = [
    { name: 'Ghana', members: 5, projects: 2 },
    { name: 'Kenya', members: 3, projects: 1 },
    { name: 'Nigeria', members: 8, projects: 3 },
    { name: 'South Africa', members: 4, projects: 2 },
    { name: 'Uganda', members: 2, projects: 1 },
    { name: 'Tanzania', members: 3, projects: 1 },
    { name: 'Rwanda', members: 2, projects: 1 },
    { name: 'Cameroon', members: 4, projects: 2 },
  ];

  const teamMembers = [
    {
      role: 'Executive Director',
      responsibilities: 'Overall strategy and leadership',
    },
    {
      role: 'Program Coordinator',
      responsibilities: 'Project management and implementation',
    },
    {
      role: 'Communications Lead',
      responsibilities: 'Marketing and community engagement',
    },
    {
      role: 'Finance Manager',
      responsibilities: 'Financial planning and reporting',
    },
  ];

  return (
    <div>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-5xl font-bold mb-4">About Youths4Change</h1>
            <p className="text-xl max-w-3xl mx-auto">
              {content?.hero_text || 'A youth-led nonprofit organization dedicated to empowering young people across Africa.'}
            </p>
          </div>
        </div>
      {/* Mission & Vision */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Mission</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {settings?.mission_statement || 'To empower young people across eight African countries...'}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Our Vision</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : (
                <p className="text-gray-600 leading-relaxed">
                  {settings?.vision_statement || 'A future where every young person in Africa has the opportunity...'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>  

        {/* Core Values */}
<div className="mb-16">
  <h2 className="text-3xl font-bold text-center mb-8">Our Core Values</h2>
  {loading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-64 w-full" />
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {coreValues.map((value) => {
        const Icon = iconMap[value.icon] || Heart;
        return (
          <Card key={value.id} className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Icon className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <CardTitle>{value.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm">{value.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  )}
</div>

        {/* Our Story */}
<Card className="mb-16">
  <CardHeader>
    <CardTitle className="text-3xl">Our Story</CardTitle>
  </CardHeader>
  <CardContent>
    {loading ? (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-4 w-full" />
        ))}
      </div>
    ) : (
      <div className="text-gray-600 leading-relaxed whitespace-pre-line">
        {content?.our_story || 'Youths4Change Initiative was founded in 2020...'}
      </div>
    )}
  </CardContent>
</Card>

        {/* Countries We Operate In */}
        <div className="mb-16">
  <h2 className="text-3xl font-bold text-center mb-8">Where We Work</h2>
  <Card>
    <CardHeader>
      <CardDescription>
        We currently operate in {stats?.countries_count || '8'} African countries, 
        with dedicated teams and projects in each location.
      </CardDescription>
    </CardHeader>
    <CardContent>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {countryStats.map((country) => (
            <div 
              key={country.country}
              className="border rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
            >
              <h3 className="font-semibold text-lg mb-2">{country.country}</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Projects:</span>
                  <Badge variant="secondary">{country.project_count}</Badge>
                </div>
                <div className="flex justify-between">
                  <span>Beneficiaries:</span>
                  <Badge variant="secondary">
                    {country.total_beneficiaries}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
</div>

{/* Team Structure */}
<div className="mb-16">
  <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
  {loading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <Skeleton key={i} className="h-32 w-full" />
      ))}
    </div>
  ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {teamRoles.map((member) => (
        <Card key={member.id}>
          <CardHeader>
            <CardTitle className="text-xl">{member.role_title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">{member.responsibilities}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )}
</div>

        {/* Impact Stats */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
  <CardHeader>
    <CardTitle className="text-3xl text-center">Our Impact So Far</CardTitle>
  </CardHeader>
  <CardContent>
    {loading ? (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <Skeleton className="h-12 w-20 mx-auto mb-2" />
            <Skeleton className="h-4 w-24 mx-auto" />
          </div>
        ))}
      </div>
    ) : stats ? (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {stats.countries_count}
          </div>
          <div className="text-gray-600">Countries</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {stats.active_projects}+
          </div>
          <div className="text-gray-600">Active Projects</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {stats.approved_applications}+
          </div>
          <div className="text-gray-600">Young Leaders</div>
        </div>
        <div>
          <div className="text-4xl font-bold text-blue-600 mb-2">
            {stats.total_beneficiaries.toLocaleString()}+
          </div>
          <div className="text-gray-600">Lives Impacted</div>
        </div>
      </div>
    ) : null}
  </CardContent>
</Card>
      </div>
    </div>
  );
}