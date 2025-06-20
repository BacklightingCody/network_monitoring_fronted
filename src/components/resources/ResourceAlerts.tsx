// import React from 'react';
import { AlertTriangle, Bell } from 'lucide-react';

export function ResourceAlerts() {
  // Mock alerts data - in real app, this would come from an API
  const alerts = [
    {
      id: 1,
      type: 'CPU',
      message: 'CPU usage exceeded 80%',
      timestamp: '10 minutes ago',
      severity: 'high'
    },
    {
      id: 2,
      type: 'Memory',
      message: 'Memory usage above threshold',
      timestamp: '15 minutes ago',
      severity: 'medium'
    },
    {
      id: 3,
      type: 'Disk',
      message: 'Low disk space warning',
      timestamp: '1 hour ago',
      severity: 'low'
    }
  ];

  return (
    <>
     
    </>
  );
}