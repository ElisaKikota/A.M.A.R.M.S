import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ProjectSpecifications } from './ProjectSpecifications';

export const ProjectDetails = ({ project, currentUser }) => {
  return (
    <div className="h-full flex flex-col">
      <Tabs defaultValue="specifications" className="flex-1">
        <TabsList>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          {/* ... other tabs ... */}
        </TabsList>

        <TabsContent value="specifications" className="flex-1">
          <ProjectSpecifications project={project} />
        </TabsContent>

        {/* ... other tab content ... */}
      </Tabs>
    </div>
  );
};