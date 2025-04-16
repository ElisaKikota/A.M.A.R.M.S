const Timeline = ({ project }) => {
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
        <div className="relative">
          {project.milestones.map((milestone, index) => (
            <div key={milestone.id} className="flex items-start mb-4">
              <div className="flex flex-col items-center mr-4">
                <div className={`w-4 h-4 rounded-full ${
                  milestone.status === 'completed' 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`} />
                {index < project.milestones.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-300" />
                )}
              </div>
              <div>
                <h4 className="font-medium">{milestone.name}</h4>
                <p className="text-sm text-gray-500">{milestone.dueDate}</p>
                <p className="text-sm mt-1">{milestone.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };