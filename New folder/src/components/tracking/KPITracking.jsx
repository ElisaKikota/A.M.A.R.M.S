const KPITracking = ({ projectId }) => {
    const kpiData = [
      {
        category: 'Technical',
        metrics: [
          { name: 'Completion Rate', value: 85, target: 90 },
          { name: 'Code Quality', value: 92, target: 95 },
          { name: 'Bug Resolution', value: 88, target: 85 }
        ]
      },
      {
        category: 'Business',
        metrics: [
          { name: 'User Growth', value: 78, target: 80 },
          { name: 'Revenue', value: 65, target: 75 },
          { name: 'Customer Satisfaction', value: 90, target: 85 }
        ]
      }
    ];
  
    return (
      <div className="space-y-6">
        {kpiData.map(category => (
          <div key={category.category} className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold mb-4">{category.category} KPIs</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {category.metrics.map(metric => (
                <div key={metric.name} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{metric.name}</span>
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      metric.value >= metric.target 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {metric.value}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 rounded-full h-2" 
                      style={{ width: `${metric.value}%` }}
                    />
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Target: {metric.target}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };