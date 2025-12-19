import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList } from '@/components/ui/navigation-menu';
import { Menu, X } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/projects', label: 'Projects' },
    { to: '/about', label: 'About' },
    { to: '/apply', label: 'Apply' },
    { to: '/donate', label: 'Donate' },
    { to: '/contact', label: 'Contact' },
  ];

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="text-xl md:text-2xl font-bold text-blue-600 flex-shrink-0">
            Youths4Change
          </Link>

          {/* Desktop Navigation Links */}
          <NavigationMenu className="hidden lg:block">
            <NavigationMenuList className="flex space-x-1">
              {navLinks.map((link) => (
                <NavigationMenuItem key={link.to}>
                  <Link to={link.to}>
                    <Button variant="ghost">{link.label}</Button>
                  </Link>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>

          {/* Desktop Admin Button */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                Admin
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 border-t">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className="px-4 py-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin"
                onClick={closeMobileMenu}
                className="px-4 py-2 border-t mt-2 pt-4 hover:bg-gray-100 rounded-md transition-colors text-blue-600 font-medium"
              >
                Admin Portal
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}