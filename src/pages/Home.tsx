import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function Home() {
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Empowering African Youth
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Creating positive change across eight countries through education, 
            mentorship, and sustainable development
          </p>
          <div className="flex gap-4 justify-center">
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: 'Countries', value: '8' },
              { label: 'Active Projects', value: '12+' },
              { label: 'Young Leaders', value: '500+' },
              { label: 'Lives Impacted', value: '5000+' },
            ].map((stat) => (
              <Card key={stat.label}>
                <CardHeader>
                  <CardTitle className="text-4xl text-blue-600 text-center">
                    {stat.value}
                  </CardTitle>
                  <CardDescription className="text-center text-lg">
                    {stat.label}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
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
              <p className="text-gray-600 text-lg text-center">
                Youths4Change Initiative is a youth-led nonprofit organization 
                dedicated to empowering young people across eight African countries 
                to create positive community change through education, mentorship, 
                and sustainable development projects.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}