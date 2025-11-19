import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';

export function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-blue-600">
            Youths4Change
          </Link>

          {/* Navigation Links */}
          <NavigationMenu>
            <NavigationMenuList className="flex space-x-1">
              <NavigationMenuItem>
                <Link to="/">
                  <Button variant="ghost">Home</Button>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/projects">
                  <Button variant="ghost">Projects</Button>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/apply">
                  <Button variant="ghost">Apply</Button>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link to="/donate">
                  <Button variant="ghost">Donate</Button>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Admin Button */}
          <Link to="/admin">
            <Button>Admin</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}