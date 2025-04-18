import React, { useState, useEffect } from 'react';
import { Filter, Search, Plus, ChevronDown } from 'react-feather';
import CampaignForm from '../components/CampaignForm';
import { useFirebase } from '../contexts/FirebaseContext';
import { firebaseDb } from '../services/firebaseDb';
import { useProjectStore } from '../stores/projectsSlice';
import { toast } from 'react-hot-toast';

const MarketingPage = () => {
  const { user } = useFirebase();
  const projects = useProjectStore(state => state.projects);
  const setProjects = useProjectStore(state => state.setProjects);
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCampaignForm, setShowCampaignForm] = useState(false);
  const [campaigns, setCampaigns] = useState([]);
  const [setLoading] = useState(true);
  const [setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        setError(null);
        const projectsData = await firebaseDb.getProjects(user.uid);
        if (isMounted) {
          setProjects(projectsData);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        if (isMounted) {
          setError('Failed to load projects. Please try again.');
          toast.error('Failed to load projects');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, [user, setProjects, setLoading, setError]);

  const handleCreateCampaign = (campaignData) => {
    const newCampaign = {
      id: campaigns.length + 1,
      ...campaignData,
      project: campaignData.isProjectLinked ? campaignData.projectName : null,
      budget: 0,
      spent: 0
    };
    setCampaigns([...campaigns, newCampaign]);
    setShowCampaignForm(false);
  };

  const handleNewCampaignClick = () => {
    setShowCampaignForm(true);
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Marketing Dashboard</h1>
        <p className="text-gray-600">Manage marketing activities across all projects</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'overview'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Project Overview
            </button>
            <button
              onClick={() => setActiveTab('campaigns')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'campaigns'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Campaigns
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'calendar'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Content Calendar
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'analytics'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Analytics
            </button>
          </nav>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search projects..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            <Filter size={16} className="mr-2" />
            Filter
            <ChevronDown size={16} className="ml-2" />
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaigns</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Milestone</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{project.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      project.status === 'active' ? 'bg-green-100 text-green-800' :
                      project.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">${(project.budget || 0).toLocaleString()}</div>
                    <div className="text-sm text-gray-500">Spent: ${(project.spent || 0).toLocaleString()}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.campaigns}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.teamSize}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.nextMilestone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'campaigns' && (
        <div>
          <div className="flex justify-end mb-6">
            <button 
              onClick={handleNewCampaignClick}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              <Plus size={16} className="mr-2" />
              New Campaign
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{campaign.name}</h3>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                    campaign.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                    campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Project</p>
                    <p className="text-sm font-medium">{campaign.project}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Goal</p>
                    <p className="text-sm font-medium">{campaign.goal}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Timeline</p>
                    <p className="text-sm font-medium">{campaign.startDate} - {campaign.endDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Theme/Message</p>
                    <p className="text-sm font-medium">{campaign.theme}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Target Audience</p>
                    <p className="text-sm font-medium">{campaign.targetAudience}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Channels</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {campaign.channels.map((channel, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {channel}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Tasks</p>
                    <div className="mt-2 space-y-2">
                      {campaign.tasks.map((task, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="font-medium">{task.title}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">{task.assignedTo}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Budget</p>
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">${campaign.budget.toLocaleString()}</p>
                      <p className="text-sm text-gray-500">Spent: ${campaign.spent.toLocaleString()}</p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(campaign.spent / campaign.budget) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Content Calendar</h2>
          <div className="grid grid-cols-7 gap-4">
            {/* Calendar days would go here */}
            <div className="text-center text-gray-500">Mon</div>
            <div className="text-center text-gray-500">Tue</div>
            <div className="text-center text-gray-500">Wed</div>
            <div className="text-center text-gray-500">Thu</div>
            <div className="text-center text-gray-500">Fri</div>
            <div className="text-center text-gray-500">Sat</div>
            <div className="text-center text-gray-500">Sun</div>
            {/* Calendar content would be dynamically generated */}
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Campaign Performance</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Social Media Blitz</span>
                  <span className="text-sm font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Email Campaign</span>
                  <span className="text-sm font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Budget Overview</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Total Budget</span>
                  <span className="text-sm font-medium">$250,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="text-sm font-medium">$175,000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCampaignForm && (
        <CampaignForm
          projects={projects}
          onClose={() => setShowCampaignForm(false)}
          onSave={handleCreateCampaign}
        />
      )}
    </div>
  );
};

export default MarketingPage; 