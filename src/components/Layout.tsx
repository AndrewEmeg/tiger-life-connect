import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingBag, Briefcase, Calendar, MessageSquare, Shield, Menu, Bell } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationsDropdown } from "./NotificationsDropdown";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";

const navIconBase = "p-2 rounded-full transition-colors focus:ring-2 focus:ring-primary";
const navIconActive = "bg-tigerGold/20 text-tigerGold";
const navIcon = "text-gray-600 hover:bg-tigerGold/10 hover:text-tigerGold";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const isAdmin = user?.user_metadata?.is_admin === true || user?.app_metadata?.is_admin === true;
  const location = useLocation();

  const navLinks = [
    {
      name: "Marketplace",
      to: "/marketplace",
      icon: <ShoppingBag size={22} aria-label="Marketplace" />,
    },
    {
      name: "Services",
      to: "/services",
      icon: <Briefcase size={22} aria-label="Services" />,
    },
    {
      name: "Events",
      to: "/events",
      icon: <Calendar size={22} aria-label="Events" />,
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderNavLinks = (onClick?: () => void) => (
    <>
      {navLinks.map(({ name, to, icon }) => (
        <Link
          key={to}
          to={to}
          onClick={onClick}
          className={`
            flex items-center gap-2 px-2 py-2 rounded transition-colors font-medium
            ${location.pathname.startsWith(to) ? "bg-tigerGold/20 text-tigerGold" : "text-gray-700 hover:bg-tigerGold/10 hover:text-tigerGold"}
            focus:outline-none
          `}
          tabIndex={0}
          aria-label={name}
          title={name}
        >
          {icon}
          <span className="ml-2">{name}</span>
        </Link>
      ))}
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-md py-3 px-2 md:px-6 w-full z-30">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2 md:gap-6">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="bg-tigerGold p-2 rounded-full">
              <span className="text-tigerBlack font-bold text-lg">TL</span>
            </div>
            <h1 className="text-xl font-bold hidden sm:inline">Tiger Life</h1>
          </Link>
          <div className="flex-1 flex items-center justify-end md:hidden pr-4">
            <Drawer>
              <DrawerTrigger asChild>
                <button
                  className="p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Open navigation menu"
                  aria-haspopup="true"
                  data-testid="mobile-menu-open"
                >
                  <Menu size={26} className="text-tigerBlack" />
                </button>
              </DrawerTrigger>
              <DrawerContent className="!rounded-t-xl !pb-8 px-0 pt-2">
                <DrawerHeader>
                  <div className="w-full flex flex-row items-center justify-between px-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-tigerGold p-2 rounded-full">
                        <span className="text-tigerBlack font-bold text-lg">TL</span>
                      </div>
                      <span className="text-xl font-bold">Tiger Life</span>
                    </div>
                    <DrawerClose asChild>
                      <button className="p-2 rounded focus:outline-none focus:ring-2 focus:ring-primary" aria-label="Close menu">
                        <span className="text-lg font-bold text-gray-500">×</span>
                      </button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>
                <nav className="flex flex-col gap-3 mt-2 px-4" aria-label="Mobile navigation">
                  {renderNavLinks(() => {/* closes Drawer on link click (handled by DrawerClose parent) */})}
                  <Link
                    to="/messages"
                    className="flex items-center gap-2 px-2 py-2 rounded text-gray-700 hover:bg-tigerGold/10 hover:text-tigerGold transition-colors font-medium"
                    tabIndex={0}
                    aria-label="Messages"
                  >
                    <MessageSquare size={22} />
                    <span className="ml-2">Messages</span>
                  </Link>
                  <Link
                    to="/notifications"
                    className="flex items-center gap-2 px-2 py-2 rounded text-gray-700 hover:bg-tigerGold/10 hover:text-tigerGold transition-colors font-medium"
                    tabIndex={0}
                    aria-label="Notifications"
                  >
                    <Bell size={22} />
                    <span className="ml-2">Notifications</span>
                    <NotificationsDropdown />
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin/events"
                      className="flex items-center gap-2 px-2 py-2 rounded text-gray-700 hover:bg-tigerGold/10 hover:text-tigerGold transition-colors font-medium"
                      aria-label="Admin Events"
                    >
                      <Shield size={22} />
                      <span className="ml-2">Admin Events</span>
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-2 py-2 rounded text-gray-700 hover:bg-tigerGold/10 hover:text-tigerGold transition-colors font-medium"
                    aria-label="Profile"
                  >
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={user?.user_metadata?.avatar_url}/>
                      <AvatarFallback>
                        {user?.email?.charAt(0).toUpperCase() ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="ml-2">Profile</span>
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="mt-4 text-tigerBlack font-semibold px-4 py-2 bg-gray-100 rounded-full w-full hover:bg-tigerGold/10 active:scale-95 transition-all"
                  >
                    Sign out
                  </button>
                </nav>
              </DrawerContent>
            </Drawer>
          </div>
          <nav
            className="hidden md:flex flex-1 items-center justify-center gap-2 sm:gap-4 md:gap-6"
            aria-label="Main navigation"
          >
            {navLinks.map(({ name, to, icon }) => (
              <Link
                key={to}
                to={to}
                className={`
                  ${navIconBase}
                  ${location.pathname.startsWith(to) ? navIconActive : navIcon}
                  focus:outline-none
                `}
                tabIndex={0}
                aria-label={name}
                title={name}
              >
                {icon}
                <span className="sr-only">{name}</span>
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2 sm:gap-4 shrink-0">
            <Link to="/messages" className={`${navIconBase} ${navIcon}`} aria-label="Messages" title="Messages">
              <MessageSquare size={22} />
              <span className="sr-only">Messages</span>
            </Link>
            <NotificationsDropdown />
            {isAdmin && (
              <Link
                to="/admin/events"
                className={`${navIconBase} ${navIcon}`}
                title="Admin Events"
                aria-label="Admin Events"
              >
                <Shield size={22} />
                <span className="sr-only">Admin Events</span>
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
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/events">Admin Events</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-2 py-8 flex-1 w-full">
        {children}
      </main>

      <footer className="bg-tigerBlack text-white py-8 mt-8">
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
