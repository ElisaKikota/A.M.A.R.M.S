const ProjectsOverview = () => {
    const projects = useProjectStore(state => state.projects);
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };
  