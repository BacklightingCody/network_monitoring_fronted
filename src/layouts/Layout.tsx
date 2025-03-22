// import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Monitor, Server, Network, Share2, Settings, Library } from 'lucide-react';
import { ThemeToggle } from '../components/ThemeToggle';

const navigation = [
  { name: '监控概览', path: '/', icon: Monitor },
  { name: '资源管理', path: '/resources', icon: Server },
  { name: '网络设备', path: '/network-devices', icon: Network },
  { name: '拓扑图', path: '/topology', icon: Share2 },
  { name: '系统设置', path: '/settings', icon: Settings },
  { name: '系统日志', path: '/logs', icon: Library }
];

export function Layout() {
  const location = useLocation();

  return (
    <>
      <div className="min-h-screen bg-background">
        <nav className="bg-card shadow-sm border-b border-border">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Monitor className="h-8 w-8 text-primary" />
                  <span className="ml-2 text-xl font-bold text-foreground">NetMonitor</span>
                </div>
                <div className="ml-10 flex space-x-8">
                  {navigation.map(({ name, path, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${
                        location.pathname === path
                          ? 'border-primary text-foreground'
                          : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="flex items-center">
                <ThemeToggle />
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </>
  );
}