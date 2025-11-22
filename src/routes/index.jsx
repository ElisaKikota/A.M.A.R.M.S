import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import Dashboard from '../pages/Dashboard';
import Projects from '../pages/Projects';
import ProjectDetails from '../pages/ProjectDetailsModal';
import TeamManagement from '../pages/Team';
import Resources from '../pages/Resources';
import AnalyticsDashboard from '../components/analytics/AnalyticsDashboard';
import MarketingPage from '../pages/MarketingPage';
import Competitions from '../pages/Competitions';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: 'projects',
        element: <Projects />,
        children: [
          {
            path: ':projectId',
            element: <ProjectDetails />
          }
        ]
      },
      {
        path: 'team',
        element: <TeamManagement />
      },
      {
        path: 'resources',
        element: <Resources />
      },
      {
        path: 'analytics',
        element: <AnalyticsDashboard />
      },
      {
        path: 'marketing',
        element: <MarketingPage />
      },
      {
        path: 'competitions',
        element: <Competitions />
      }
    ]
  }
]);