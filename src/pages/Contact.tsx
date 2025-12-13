import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { contactService } from '@/services/contactService';
import type { ContactInfo, SocialMedia, RegionalOffice } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Phone, MapPin, Globe, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

// Icon mapping
const iconMap: Record<string, any> = {
  Mail,
  Phone,
  MapPin,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
};

export function Contact() {
  const [contactInfo, setContactInfo] = useState<ContactInfo[]>([]);
  const [socialMedia, setSocialMedia] = useState<SocialMedia[]>([]);
  const [regionalOffices, setRegionalOffices] = useState<RegionalOffice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContactData();
  }, []);

  const loadContactData = async () => {
    try {
      const [contactRes, socialRes, officesRes] = await Promise.all([
        contactService.getContactInfo(),
        contactService.getSocialMedia(),
        contactService.getRegionalOffices(),
      ]);

      if (contactRes.success && contactRes.data) {
        setContactInfo(contactRes.data);
      }

      if (socialRes.success && socialRes.data) {
        setSocialMedia(socialRes.data);
      }

      if (officesRes.success && officesRes.data) {
        setRegionalOffices(officesRes.data);
      }
    } catch (error) {
      console.error('Error loading contact data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">Get in Touch</h1>
          <p className="text-xl max-w-3xl mx-auto">
            We'd love to hear from you. Whether you want to get involved, 
            partner with us, or learn more about our work.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Main Contact Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {loading ? (
            // Loading skeletons
            [1, 2, 3, 4].map((i) => (
              <Card key={i} className="text-center">
                <CardHeader>
                  <Skeleton className="h-16 w-16 rounded-full mx-auto mb-4" />
                  <Skeleton className="h-6 w-24 mx-auto" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-32 mx-auto" />
                </CardContent>
              </Card>
            ))
          ) : (
            contactInfo.map((info) => {
              const Icon = iconMap[info.icon] || Globe;
              return (
                <Card key={info.id} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-center mb-4">
                      <div className="bg-blue-100 p-4 rounded-full">
                        <Icon className="h-6 w-6 text-blue-600" />
                      </div>
                    </div>
                    <CardTitle className="text-lg">{info.label}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {info.link ? (
                      <a 
                        href={info.link}
                        className="text-blue-600 hover:underline break-all"
                        target={info.link.startsWith('http') ? '_blank' : undefined}
                        rel={info.link.startsWith('http') ? 'noopener noreferrer' : undefined}
                      >
                        {info.value}
                      </a>
                    ) : (
                      <p className="text-gray-600">{info.value}</p>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Social Media */}
        <Card className="mb-16">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Follow Us on Social Media</CardTitle>
            <CardDescription>
              Stay updated with our latest projects, events, and success stories
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center gap-4 flex-wrap">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-12 w-32" />
                ))}
              </div>
            ) : (
              <div className="flex justify-center gap-4 flex-wrap">
                {socialMedia.map((social) => {
                  const Icon = iconMap[social.icon] || Globe;
                  return (
                    <a
                      key={social.id}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 px-6 py-3 rounded-lg border transition-all ${social.color_class}`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="font-medium">{social.platform_name}</span>
                    </a>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Regional Contacts */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">Regional Contacts</h2>
          <Card>
            <CardHeader>
              <CardDescription>
                Get in touch with our teams in specific countries
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {regionalOffices.map((office) => (
                    <div 
                      key={office.id}
                      className="border rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
                    >
                      <h3 className="font-semibold text-lg mb-3">{office.country}</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Mail className="h-4 w-4 flex-shrink-0" />
                          <a 
                            href={`mailto:${office.email}`}
                            className="text-blue-600 hover:underline break-all"
                          >
                            {office.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <a 
                            href={`tel:${office.phone.replace(/\s/g, '')}`}
                            className="text-blue-600 hover:underline"
                          >
                            {office.phone}
                          </a>
                        </div>
                        {office.address && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin className="h-4 w-4 flex-shrink-0" />
                            <span>{office.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ways to Connect */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card>
            <CardHeader>
              <CardTitle>Volunteer</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Join our team and contribute your skills to make a difference
              </p>
              <Link to="/apply">
                <Button className="w-full" variant="outline">
                  Learn More
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Partner With Us</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Collaborate on projects and initiatives across Africa
              </p>
              <a 
                href={`mailto:${contactInfo.find(c => c.icon === 'Mail')?.value || 'info@youths4change.org'}?subject=Partnership Inquiry`}
              >
                <Button className="w-full" variant="outline">
                  Partnership Info
                </Button>
              </a>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media Inquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Press and media contacts for interviews and features
              </p>
              <a 
                href={`mailto:${contactInfo.find(c => c.icon === 'Mail')?.value || 'info@youths4change.org'}?subject=Media Inquiry`}
              >
                <Button className="w-full" variant="outline">
                  Media Kit
                </Button>
              </a>
            </CardContent>
          </Card>
        </div>

        {/* Office Hours */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Office Hours</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="space-y-2 text-gray-700">
              <p className="font-semibold">Monday - Friday</p>
              <p>9:00 AM - 5:00 PM (GMT)</p>
              <p className="text-sm text-gray-600 mt-4">
                We aim to respond to all inquiries within 24-48 hours
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}