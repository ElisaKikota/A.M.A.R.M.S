const ResourceAllocation = () => {
    const resources = [
      { name: '3D Printer', status: 'available', nextAvailable: 'Now' },
      { name: 'Workshop Space', status: 'in-use', nextAvailable: '2 hours' },
      { name: 'Testing Equipment', status: 'maintenance', nextAvailable: 'Tomorrow' }
    ];
  
    return (
      <div className="p-4 bg-white rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Resource Allocation</h3>
          <button className="text-blue-600 hover:underline">Manage Resources</button>
        </div>
        <div className="space-y-4">
          {resources.map(resource => (
            <div key={resource.name} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{resource.name}</p>
                <p className="text-sm text-gray-500">Next Available: {resource.nextAvailable}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm ${
                resource.status === 'available' ? 'bg-green-100 text-green-800' :
                resource.status === 'in-use' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {resource.status.charAt(0).toUpperCase() + resource.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };