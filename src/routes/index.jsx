import { createBrowserRouter } from 'react-router-dom';
import MarketingPage from '../pages/MarketingPage';

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
      }
    ]
  }
]);