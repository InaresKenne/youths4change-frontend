import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Target, Heart, Globe, Mail, Linkedin, Twitter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { analyticsService} from '@/services/analyticsService';
import type {OverviewStats, CountryStats } from '@/services/analyticsService';
import { Skeleton } from '@/components/ui/skeleton';
import { settingsService } from '@/services/settingsService';
import type { SiteSettings, PageContent, CoreValue, Founder, TeamMember } from '@/types';
import { teamService } from '@/services/teamService';
import { getOptimizedImageUrl } from '@/utils/cloudinary';

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
  const [founder, setFounder] = useState<Founder | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFounderBio, setExpandedFounderBio] = useState(false);
  const [expandedMemberBios, setExpandedMemberBios] = useState<Record<number, boolean>>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [overviewRes, countryRes, settingsRes, contentRes, valuesRes, founderRes, teamRes] = await Promise.all([
        analyticsService.getOverview(),
        analyticsService.getProjectsByCountry(),
        settingsService.getSettings(),
        settingsService.getPageContent('about'),
        settingsService.getCoreValues(),
        teamService.getFounder(),
        teamService.getTeamMembers(),
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
      
      if (founderRes.success && founderRes.data) {
        console.log('Founder data loaded:', founderRes.data);
        setFounder(founderRes.data);
      } else {
        console.log('No founder data:', founderRes);
      }
      
      if (teamRes.success && teamRes.data) {
        console.log('Team members loaded:', teamRes.data);
        setTeamMembers(teamRes.data);
      } else {
        console.log('No team members:', teamRes);
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
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12 sm:py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4">About Youths4Change</h1>
            <p className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto px-2">
              {content?.hero_text || 'A youth-led nonprofit organization dedicated to empowering young people across Africa.'}
            </p>
          </div>
        </div>
      {/* Mission & Vision */}
      <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12 md:mb-16">
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
<div className="mb-8 sm:mb-12 md:mb-16">
  <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6 md:mb-8">Our Core Values</h2>
  {loading ? (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

{/* Founder Section */}
{founder && (
  <div className="mb-16">
    <h2 className="text-3xl font-bold text-center mb-8">Meet Our Founder</h2>
    <Card className="max-w-4xl mx-auto">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Founder Image */}
          <div className="shrink-0">
            {founder.image_url ? (
              <img
                src={founder.image_url.includes('cloudinary.com') 
                  ? getOptimizedImageUrl(founder.image_url, { width: 400, quality: 'auto:best', format: 'auto' })
                  : founder.image_url
                }
                alt={founder.name}
                className="w-full md:w-64 h-auto rounded-lg shadow-lg"
                onError={(e) => {
                  console.error('Failed to load founder image:', founder.image_url);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-lg bg-gray-200 flex items-center justify-center">
                <Users className="w-20 h-20 text-gray-400" />
              </div>
            )}
          </div>

          {/* Founder Info */}
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">{founder.name}</h3>
            <p className="text-blue-600 font-semibold mb-4">{founder.title}</p>
            <div className="text-gray-700 whitespace-pre-line mb-6">
              {founder.bio && founder.bio.length > 300 ? (
                <>
                  {expandedFounderBio ? founder.bio : `${founder.bio.substring(0, 300)}...`}
                  <button
                    onClick={() => setExpandedFounderBio(!expandedFounderBio)}
                    className="text-blue-600 hover:text-blue-700 font-semibold ml-2"
                  >
                    {expandedFounderBio ? 'See less' : 'See more'}
                  </button>
                </>
              ) : (
                founder.bio
              )}
            </div>
            
            {/* Social Links */}
            <div className="flex gap-4">
              {founder.email && (
                <a
                  href={`mailto:${founder.email}`}
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <Mail className="w-5 h-5" />
                </a>
              )}
              {founder.linkedin_url && (
                <a
                  href={founder.linkedin_url.startsWith('http') ? founder.linkedin_url : `https://${founder.linkedin_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {founder.twitter_url && (
                <a
                  href={founder.twitter_url.startsWith('http') ? founder.twitter_url : `https://${founder.twitter_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
)}

{/* Team Members Section */}
<div className="mb-16">
  <h2 className="text-3xl font-bold text-center mb-8">Our Team</h2>
  
  {loading ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-96 w-full" />
      ))}
    </div>
  ) : teamMembers.length > 0 ? (
    <>
      {/* Executive Team - Grouped by Country */}
      {teamMembers.filter(m => m.role_type === 'executive').length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-center mb-8">Executive Team</h3>
          {/* Group executives by country */}
          {Array.from(new Set(teamMembers.filter(m => m.role_type === 'executive' && m.country).map(m => m.country)))
            .sort()
            .map((country) => (
              <div key={country} className="mb-10">
                {/* Country Header */}
                <div className="flex items-center justify-center mb-6">
                  <div className="flex-1 border-t border-gray-300"></div>
                  <h4 className="px-6 text-xl font-bold text-blue-600">{country}</h4>
                  <div className="flex-1 border-t border-gray-300"></div>
                </div>
                
                {/* Team members for this country */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teamMembers
                    .filter(m => m.role_type === 'executive' && m.country === country)
                    .map((member) => (
                      <Card key={member.id} className="hover:shadow-lg transition">
                        <CardContent className="p-6">
                          {/* Member Image */}
                          <div className="mb-4">
                            {member.image_url ? (
                              <img
                                src={member.image_url.includes('cloudinary.com')
                                  ? getOptimizedImageUrl(member.image_url, { width: 400, quality: 'auto:best', format: 'auto' })
                                  : member.image_url
                                }
                                alt={member.name}
                                className="w-full h-auto rounded-lg"
                                onError={(e) => {
                                  console.error('Failed to load team member image:', member.name, member.image_url);
                                  e.currentTarget.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                                <Users className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          {/* Member Info */}
                          <h4 className="text-xl font-bold mb-1">{member.name}</h4>
                          <p className="text-blue-600 font-semibold mb-2">{member.position}</p>
                          {member.bio && (
                            <div className="text-gray-600 text-sm mb-4">
                              {member.bio.length > 150 ? (
                                <>
                                  {expandedMemberBios[member.id] ? member.bio : `${member.bio.substring(0, 150)}...`}
                                  <button
                                    onClick={() => setExpandedMemberBios(prev => ({
                                      ...prev,
                                      [member.id]: !prev[member.id]
                                    }))}
                                    className="text-blue-600 hover:text-blue-700 font-semibold ml-1 block mt-1"
                                  >
                                    {expandedMemberBios[member.id] ? 'See less' : 'See more'}
                                  </button>
                                </>
                              ) : (
                                member.bio
                              )}
                            </div>
                          )}
                          
                          {/* Social Links */}
                          <div className="flex gap-3">
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="text-gray-600 hover:text-blue-600 transition"
                              >
                                <Mail className="w-4 h-4" />
                              </a>
                            )}
                            {member.linkedin_url && (
                              <a
                                href={member.linkedin_url.startsWith('http') ? member.linkedin_url : `https://${member.linkedin_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-blue-600 transition"
                              >
                                <Linkedin className="w-4 h-4" />
                              </a>
                            )}
                            {member.twitter_url && (
                              <a
                                href={member.twitter_url.startsWith('http') ? member.twitter_url : `https://${member.twitter_url}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-600 hover:text-blue-600 transition"
                              >
                                <Twitter className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          
          {/* Executives without country */}
          {teamMembers.filter(m => m.role_type === 'executive' && !m.country).length > 0 && (
            <div className="mb-10">
              <div className="flex items-center justify-center mb-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <h4 className="px-6 text-xl font-bold text-gray-600">Other Executives</h4>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers
                  .filter(m => m.role_type === 'executive' && !m.country)
                  .map((member) => (
                    <Card key={member.id} className="hover:shadow-lg transition">
                      <CardContent className="p-6">
                        <div className="mb-4">
                          {member.image_url ? (
                            <img
                              src={member.image_url.includes('cloudinary.com')
                                ? getOptimizedImageUrl(member.image_url, { width: 400, quality: 'auto:best', format: 'auto' })
                                : member.image_url
                              }
                              alt={member.name}
                              className="w-full h-auto rounded-lg"
                              onError={(e) => {
                                console.error('Failed to load team member image:', member.name, member.image_url);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Users className="w-12 h-12 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        <h4 className="text-xl font-bold mb-1">{member.name}</h4>
                        <p className="text-blue-600 font-semibold mb-2">{member.position}</p>
                        {member.bio && (
                          <div className="text-gray-600 text-sm mb-4">
                            {member.bio.length > 150 ? (
                              <>
                                {expandedMemberBios[member.id] ? member.bio : `${member.bio.substring(0, 150)}...`}
                                <button
                                  onClick={() => setExpandedMemberBios(prev => ({
                                    ...prev,
                                    [member.id]: !prev[member.id]
                                  }))}
                                  className="text-blue-600 hover:text-blue-700 font-semibold ml-1 block mt-1"
                                >
                                  {expandedMemberBios[member.id] ? 'See less' : 'See more'}
                                </button>
                              </>
                            ) : (
                              member.bio
                            )}
                          </div>
                        )}
                        
                        <div className="flex gap-3">
                          {member.email && (
                            <a href={`mailto:${member.email}`} className="text-gray-600 hover:text-blue-600 transition">
                              <Mail className="w-4 h-4" />
                            </a>
                          )}
                          {member.linkedin_url && (
                            <a href={member.linkedin_url.startsWith('http') ? member.linkedin_url : `https://${member.linkedin_url}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition">
                              <Linkedin className="w-4 h-4" />
                              </a>
                          )}
                          {member.twitter_url && (
                            <a href={member.twitter_url.startsWith('http') ? member.twitter_url : `https://${member.twitter_url}`} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition">
                              <Twitter className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Board Members */}
      {teamMembers.filter(m => m.role_type === 'board').length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-center mb-6">Board Members</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.filter(m => m.role_type === 'board').map((member) => (
              <Card key={member.id} className="hover:shadow-lg transition">
                <CardContent className="p-6">
                  {member.image_url ? (
                    <img
                      src={member.image_url.includes('cloudinary.com')
                        ? getOptimizedImageUrl(member.image_url, { width: 400, quality: 'auto:best', format: 'auto' })
                        : member.image_url
                      }
                      alt={member.name}
                      className="w-full h-auto rounded-lg mb-4"
                      onError={(e) => {
                        console.error('Failed to load board member image:', member.name, member.image_url);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <h4 className="text-xl font-bold mb-1">{member.name}</h4>
                  <p className="text-blue-600 font-semibold mb-2">{member.position}</p>
                  {member.country && (
                    <Badge variant="secondary" className="mb-3">{member.country}</Badge>
                  )}
                  {member.bio && (
                    <div className="text-gray-600 text-sm">
                      {member.bio.length > 150 ? (
                        <>
                          {expandedMemberBios[member.id] ? member.bio : `${member.bio.substring(0, 150)}...`}
                          <button
                            onClick={() => setExpandedMemberBios(prev => ({
                              ...prev,
                              [member.id]: !prev[member.id]
                            }))}
                            className="text-blue-600 hover:text-blue-700 font-semibold ml-1 block mt-1"
                          >
                            {expandedMemberBios[member.id] ? 'See less' : 'See more'}
                          </button>
                        </>
                      ) : (
                        member.bio
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Advisors */}
      {teamMembers.filter(m => m.role_type === 'advisor').length > 0 && (
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-center mb-6">Advisors</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {teamMembers.filter(m => m.role_type === 'advisor').map((member) => (
              <Card key={member.id} className="text-center">
                <CardContent className="p-4">
                  {member.image_url ? (
                    <img
                      src={getOptimizedImageUrl(member.image_url, { width: 200, height: 200, quality: 'auto', format: 'auto' })}
                      alt={member.name}
                      className="w-32 h-32 object-cover rounded-full mx-auto mb-3"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <Users className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <h4 className="font-bold mb-1">{member.name}</h4>
                  <p className="text-sm text-blue-600">{member.position}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </>
  ) : (
    <p className="text-center text-gray-600">No team members to display yet.</p>
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