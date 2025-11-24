import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { analyticsService } from '@/services/analyticsService';
import type { OverviewStats } from '@/services/analyticsService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FolderKanban, 
  Users, 
  DollarSign, 
  Globe,
  TrendingUp,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export function AdminDashboard() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await analyticsService.getOverview();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    {
      title: 'Total Projects',
      value: stats.total_projects,
      description: `${stats.active_projects} active`,
      icon: FolderKanban,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      link: '/admin/projects',
    },
    {
      title: 'Applications',
      value: stats.total_applications,
      description: `${stats.approved_applications} approved`,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      link: '/admin/applications',
    },
    {
      title: 'Total Donations',
      value: `$${stats.total_donations.toLocaleString()}`,
      description: 'All time',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      link: '/admin/donations',
    },
    {
      title: 'Countries',
      value: stats.countries_count,
      description: `${stats.total_beneficiaries.toLocaleString()} beneficiaries`,
      icon: Globe,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      link: '/admin/projects',
    },
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Here's an overview of your organization.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          [1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))
        ) : (
          statCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} to={stat.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </CardTitle>
                    <div className={`p-2 rounded-full ${stat.bgColor}`}>
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks and shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link to="/admin/projects/new">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2" variant="outline">
                <FolderKanban className="h-6 w-6" />
                <span>Create New Project</span>
              </Button>
            </Link>
            
            <Link to="/admin/applications?filter=pending">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2" variant="outline">
                <Clock className="h-6 w-6" />
                <span>Review Applications</span>
              </Button>
            </Link>
            
            <Link to="/admin/settings">
              <Button className="w-full h-auto py-4 flex flex-col items-center gap-2" variant="outline">
                <CheckCircle2 className="h-6 w-6" />
                <span>Update Settings</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Growth Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              [1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : stats ? (
              <>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Active Projects</span>
                  <span className="text-xl font-bold text-blue-600">
                    {stats.active_projects}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Approved Leaders</span>
                  <span className="text-xl font-bold text-green-600">
                    {stats.approved_applications}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                  <span className="text-sm font-medium">Total Beneficiaries</span>
                  <span className="text-xl font-bold text-purple-600">
                    {stats.total_beneficiaries.toLocaleString()}
                  </span>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Database</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">API</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">Authentication</span>
              </div>
              <span className="text-xs text-green-600 font-medium">Active</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}