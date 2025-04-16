const TeamManagement = () => {
    const teamMembers = [
      { name: 'John Doe', role: 'Technical Lead', projects: ['Voice Training', 'EnergyOpt'] },
      { name: 'Jane Smith', role: 'Developer', projects: ['Eco-Points'] },
      { name: 'Mike Johnson', role: 'Business Analyst', projects: ['Voice Training'] }
    ];
  
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Team Members</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg">
            Add Member
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Projects
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {teamMembers.map(member => (
                <tr key={member.name}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium">{member.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {member.role}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {member.projects.map(project => (
                        <span key={project} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                          {project}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button className="text-blue-600 hover:underline">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };