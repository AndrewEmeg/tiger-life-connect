
import React from "react";
import { Link } from "react-router-dom";
import { Search, MessageSquare, Bell, User, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-tigerGold p-2 rounded-full">
              <span className="text-tigerBlack font-bold text-lg">TL</span>
            </div>
            <h1 className="text-xl font-bold">Tiger Life</h1>
          </Link>
          
          {/* Navigation Icons */}
          <div className="flex items-center gap-6">
            <Link to="/search" className="text-gray-600 hover:text-tigerGold">
              <Search size={22} />
            </Link>
            <Link to="/messages" className="text-gray-600 hover:text-tigerGold">
              <MessageSquare size={22} />
            </Link>
            <Link to="/notifications" className="text-gray-600 hover:text-tigerGold">
              <Bell size={22} />
            </Link>
            
            {user?.is_admin && (
              <Link 
                to="/admin/events" 
                className="text-gray-600 hover:text-tigerGold flex items-center"
                title="Admin Events"
              >
                <Shield size={22} />
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <Avatar>
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback>
                    {user?.email?.charAt(0).toUpperCase() ?? 'U'}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                {user?.is_admin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/events">Admin Events</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      
      {/* Footer */}
      <footer className="bg-tigerBlack text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-tigerGold font-bold text-xl mb-4">Tiger Life</h3>
              <p className="max-w-md text-gray-300">
                The campus platform for Grambling State University students to buy, sell, and connect.
              </p>
            </div>
            <div className="mt-6 md:mt-0">
              <h4 className="font-semibold text-tigerGold mb-3">Quick Links</h4>
              <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                <Link to="/marketplace" className="text-gray-300 hover:text-tigerGold">Marketplace</Link>
                <Link to="/services" className="text-gray-300 hover:text-tigerGold">Services</Link>
                <Link to="/events" className="text-gray-300 hover:text-tigerGold">Events</Link>
                <Link to="/profile" className="text-gray-300 hover:text-tigerGold">Profile</Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
            <p>© {new Date().getFullYear()} Tiger Life. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
