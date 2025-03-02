// import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Monitor, Server, Network, Share2, Settings } from 'lucide-react';

const navigation = [
  { name: '监控概览', path: '/', icon: Monitor },
  { name: '资源管理', path: '/resources', icon: Server },
  { name: '网络设备', path: '/network-devices', icon: Network },
  { name: '拓扑图', path: '/topology', icon: Share2 },
  { name: '系统设置', path: '/settings', icon: Settings },
];

export function Layout() {
  const location = useLocation();

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <Monitor className="h-8 w-8 text-indigo-600" />
                  <span className="ml-2 text-xl font-bold text-gray-900">NetMonitor</span>
                </div>
                <div className="ml-10 flex space-x-8">
                  {navigation.map(({ name, path, icon: Icon }) => (
                    <Link
                      key={path}
                      to={path}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 ${location.pathname === path
                          ? 'border-indigo-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {name}
                    </Link>
                  ))}
                </div>
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