import { createBrowserRouter } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { Overview } from '../pages/Overview';
import { Resources } from '../pages/Resources';
import { NetworkDevices } from '../pages/NetworkDevices';
import { Topology } from '../pages/Topology';
import { Settings } from '../pages/Settings';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Overview /> },
      { path: '/resources', element: <Resources /> },
      { path: '/network-devices', element: <NetworkDevices /> },
      { path: '/topology', element: <Topology /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
]);