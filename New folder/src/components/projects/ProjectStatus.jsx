const ProjectStatus = ({ project }) => {
    const milestoneStatus = useMemo(() => {
      const total = project.milestones.length;
      const completed = project.milestones.filter(m => m.status === 'completed').length;
      return {
        percentage: (completed / total) * 100,
        completed,
        total
      };
    }, [project.milestones]);
  
    return (
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{project.name}</h3>
          <Badge
            variant={project.status === 'active' ? 'success' : 'warning'}
          >
            {project.status}
          </Badge>
        </div>
  
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span>Overall Progress</span>
              <span>{milestoneStatus.percentage.toFixed(0)}%</span>
            </div>
            <Progress value={milestoneStatus.percentage} className="h-2" />
          </div>
  
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-sm text-gray-500">Start Date</span>
              <p className="font-medium">{formatDate(project.timeline.start)}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">End Date</span>
              <p className="font-medium">{formatDate(project.timeline.end)}</p>
            </div>
          </div>
  
          <div>
            <h4 className="font-medium mb-2">Team Members</h4>
            <div className="flex -space-x-2">
              {project.team.map(member => (
                <Avatar
                  key={member}
                  className="border-2 border-white"
                  // Add member image or initials
                />
              ))}
            </div>
          </div>
        </div>
      </Card>
    );
  };