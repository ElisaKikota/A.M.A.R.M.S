import React from 'react';
import { LineChart, BarChart } from 'recharts';
import { Card } from '@/components/ui/card';

export const AnalyticsDashboard = () => {
  const projectStore = useProjectStore();
  const projects = Object.values(projectStore.projects);

  const progressData = projects.map(project => ({
    name: project.name,
    progress: calculateProgress(project),
    target: 100
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Projects Overview</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Active Projects</span>
              <span className="font-medium">{projects.length}</span>
            </div>
            <div className="flex justify-between">
              <span>On Track</span>
              <span className="text-green-600 font-medium">
                {projects.filter(p => isOnTrack(p)).length}
              </span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Resources</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Utilization Rate</span>
              <span className="font-medium">78%</span>
            </div>
            <div className="flex justify-between">
              <span>Available Equipment</span>
              <span className="font-medium">12/15</span>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Team Performance</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Active Members</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between">
              <span>Task Completion Rate</span>
              <span className="font-medium">92%</span>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Project Progress</h3>
          <div className="h-64">
            <BarChart width={400} height={250} data={progressData}>
              {/* Chart configuration */}
            </BarChart>
          </div>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-4">Resource Allocation</h3>
          <div className="h-64">
            <PieChart width={400} height={250}>
              {/* Chart configuration */}
            </PieChart>
          </div>
        </Card>
      </div>
    </div>
  );
};