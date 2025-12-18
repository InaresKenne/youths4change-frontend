import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminDonationService} from '@/services/adminDonationService';
import type {DonationWithProject } from '@/services/adminDonationService';
import { projectService } from '@/services/projectService';
import { adminContactService } from '@/services/adminContactService';
import type { Project } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Search, 
  Filter,
  Eye,
  DollarSign,
  TrendingUp,
  Globe,
  FolderKanban,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DonationStats {
  total_amount: number;
  total_count: number;
  by_country: { country: string; amount: number; count: number }[];
  by_project: { project_id: number; project_name: string; amount: number; count: number }[];
}

export function DonationsList() {
  const [donations, setDonations] = useState<DonationWithProject[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<DonationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [countries, setCountries] = useState<string[]>([]);

  useEffect(() => {
    loadData();
    loadCountries();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [donationsRes, projectsRes, statsRes] = await Promise.all([
        adminDonationService.getAll(),
        projectService.getAll(),
        adminDonationService.getStats(),
      ]);
      
      if (donationsRes.success && donationsRes.data) {
        setDonations(donationsRes.data);
      }
      
      if (projectsRes.success && projectsRes.data) {
        setProjects(projectsRes.data);
      }
      
      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (error) {
      console.error('Error loading donations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCountries = async () => {
    try {
      const response = await adminContactService.getOfficeCountries();
      if (response.success && response.data) {
        setCountries(response.data);
      }
    } catch (error) {
      console.error('Error loading countries:', error);
    }
  };

  // Filter donations
  const filteredDonations = donations.filter(donation => {
    const matchesSearch = 
      donation.donor_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donation.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = countryFilter === 'all' || donation.country === countryFilter;
    const matchesProject = projectFilter === 'all' || donation.project_id.toString() === projectFilter;
    const matchesStatus = statusFilter === 'all' || donation.payment_status === statusFilter;
    
    return matchesSearch && matchesCountry && matchesProject && matchesStatus;
  });

  // Calculate filtered totals
  const filteredTotal = filteredDonations.reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Donations</h1>
        <p className="text-gray-600">View and manage all donations</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Donations
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  ${stats?.total_amount.toLocaleString() || '0'}
                </div>
                <p className="text-xs text-gray-500">
                  {stats?.total_count || 0} donations
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Average Donation
            </CardTitle>
            <TrendingUp className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  ${stats && stats.total_count > 0 
                    ? Math.round(stats.total_amount / stats.total_count).toLocaleString() 
                    : '0'
                  }
                </div>
                <p className="text-xs text-gray-500">per donation</p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Country
            </CardTitle>
            <Globe className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : stats?.by_country && stats.by_country.length > 0 ? (
              <>
                <div className="text-2xl font-bold text-orange-600">
                  {stats.by_country[0].country}
                </div>
                <p className="text-xs text-gray-500">
                  ${stats.by_country[0].amount.toLocaleString()}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-400">N/A</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Project
            </CardTitle>
            <FolderKanban className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : stats?.by_project && stats.by_project.length > 0 ? (
              <>
                <div className="text-lg font-bold text-purple-600 truncate">
                  {stats.by_project[0].project_name || 'Unknown'}
                </div>
                <p className="text-xs text-gray-500">
                  ${stats.by_project[0].amount.toLocaleString()}
                </p>
              </>
            ) : (
              <div className="text-2xl font-bold text-gray-400">N/A</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by donor name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Country Filter */}
            <Select value={countryFilter} onValueChange={setCountryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Countries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Countries</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Project Filter */}
            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id.toString()}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardDescription>
              Showing {filteredDonations.length} of {donations.length} donations
            </CardDescription>
            <Badge variant="secondary" className="text-base px-4">
              Total: ${filteredTotal.toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredDonations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg mb-2">No donations found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Donor</TableHead>
                    <TableHead>Project</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Payment Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{donation.donor_name}</div>
                          <div className="text-sm text-gray-500">{donation.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[150px] truncate">
                          {donation.project_name || `Project #${donation.project_id}`}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          {donation.currency || 'GHS'} {donation.amount.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell>{donation.country}</TableCell>
                      <TableCell>
                        <span className="text-xs capitalize">
                          {donation.payment_method?.replace('_', ' ') || 'N/A'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {new Date(donation.donation_date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            donation.payment_status === 'verified' 
                              ? 'bg-green-100 text-green-800 hover:bg-green-100'
                              : donation.payment_status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                                : donation.payment_status === 'rejected'
                                  ? 'bg-red-100 text-red-800 hover:bg-red-100'
                                  : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                          }
                        >
                          {donation.payment_status || 'completed'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link to={`/admin/donations/${donation.id}`}>
                              <DropdownMenuItem>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                            </Link>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}