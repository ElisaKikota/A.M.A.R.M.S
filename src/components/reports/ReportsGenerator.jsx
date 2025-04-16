import React, { useState } from 'react';
import { BarChart, Database, Users, Calendar, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const ReportsGenerator = () => {
  
  const navigate = useNavigate();
  const [generatingReport, setGeneratingReport] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  
  const reportTypes = [
    { 
      id: 'progress', 
      name: 'Progress Report', 
      icon: BarChart,
      description: 'Overview of project progress, milestones, and completion status.'
    },
    { 
      id: 'resources', 
      name: 'Resource Utilization', 
      icon: Database,
      description: 'Analysis of resource allocation and usage across projects.'
    },
    { 
      id: 'team', 
      name: 'Team Performance', 
      icon: Users,
      description: 'Insights into team productivity and task completion.'
    },
    { 
      id: 'timeline', 
      name: 'Project Timeline', 
      icon: Calendar,
      description: 'Timeline view of project phases and milestone completion.'
    }
  ];

  const handleReportSelect = (reportType) => {
    setSelectedReport(reportType);
  };

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      toast.error('Please select a report type');
      return;
    }

    setGeneratingReport(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Navigate to the appropriate section based on report type
      switch (selectedReport.id) {
        case 'progress':
          // Open progress section
          navigate('/reports', { state: { activeTab: 'progress' } });
          break;
        case 'resources':
          // Open resources section
          navigate('/reports', { state: { activeTab: 'resources' } });
          break;
        case 'team':
          // Open team performance section
          navigate('/reports', { state: { activeTab: 'team' } });
          break;
        case 'timeline':
          // Open timeline section
          navigate('/reports', { state: { activeTab: 'timeline' } });
          break;
        default:
          toast.error('Invalid report type');
      }
      
      toast.success(`Generated ${selectedReport.name}`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report');
    } finally {
      setGeneratingReport(false);
      setSelectedReport(null);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Generate Reports</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {reportTypes.map(type => (
          <button
            key={type.id}
            className={`p-4 border rounded-lg hover:bg-gray-50 transition-colors flex flex-col items-center ${
              selectedReport?.id === type.id ? 'border-blue-500 bg-blue-50' : ''
            }`}
            onClick={() => handleReportSelect(type)}
          >
            <type.icon className={`w-8 h-8 mb-2 ${
              selectedReport?.id === type.id ? 'text-blue-600' : 'text-gray-500'
            }`} />
            <span className="font-medium">{type.name}</span>
            <p className="text-xs text-gray-500 mt-2 text-center">{type.description}</p>
          </button>
        ))}
      </div>
      
      {selectedReport && (
        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Selected Report: {selectedReport.name}</h4>
              <p className="text-sm text-gray-500">{selectedReport.description}</p>
            </div>
            <button
              onClick={handleGenerateReport}
              disabled={generatingReport}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                generatingReport 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {generatingReport ? (
                <>
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Download size={16} />
                  Generate Report
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsGenerator;