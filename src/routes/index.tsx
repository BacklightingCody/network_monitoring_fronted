import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../layouts/Layout';
import { Overview } from '../pages/Overview';
import { Resources } from '../pages/Resources';
import { NetworkResource } from '../pages/NetworkResource';
import { Topology } from '../pages/Topology';
import { Settings } from '../pages/Settings';
import { SystemLogs } from '../pages/SystemLogs';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Overview /> },
      { path: '/resources', element: <Resources /> },
      { path: '/network-resource', element: <NetworkResource /> },
      { path: '/topology', element: <Topology /> },
      { path: '/settings', element: <Settings /> },
      { path: '/logs', element: <SystemLogs /> }
    ],
  },
]);