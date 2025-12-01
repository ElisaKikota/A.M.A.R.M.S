import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Plus, 
  TrendingUp, 
  Clock,
  Search,
  FileText,
  Target
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import CompetitionModal from '../components/competitions/CompetitionModal';
import CompetitionCard from '../components/competitions/CompetitionCard';
import ApplicationModal from '../components/competitions/ApplicationModal';
import CompetitionMetrics from '../components/competitions/CompetitionMetrics';
import { 
  getAllCompetitions, 
  getCompetitionMetrics,
  getAllApplications 
} from '../services/competitionService';

const Competitions = () => {
  const { hasPermission } = useAuth();
  
  const [competitions, setCompetitions] = useState([]);
  const [applications, setApplications] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCompetitionModal, setShowCompetitionModal] = useState(false);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (hasPermission('competitions.view')) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [hasPermission]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [competitionsData, applicationsData, metricsData] = await Promise.all([
        getAllCompetitions(),
        getAllApplications(),
        getCompetitionMetrics()
      ]);
      
      setCompetitions(competitionsData || []);
      setApplications(applicationsData || []);
      setMetrics(metricsData || {
        totalApplications: 0,
        successRate: 0,
        totalFundingReceived: 0,
        activeCompetitions: 0,
        upcomingDeadlines: 0
      });
    } catch (error) {
      console.error('Error loading competitions data:', error);
      toast.error('Failed to load competitions data');
      setCompetitions([]);
      setApplications([]);
      setMetrics({
        totalApplications: 0,
        successRate: 0,
        totalFundingReceived: 0,
        activeCompetitions: 0,
        upcomingDeadlines: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCompetition = () => {
    setSelectedCompetition(null);
    setShowCompetitionModal(true);
  };

  const handleEditCompetition = (competition) => {
    setSelectedCompetition(competition);
    setShowCompetitionModal(true);
  };

  const handleCreateApplication = (competition) => {
    setSelectedCompetition(competition);
    setSelectedApplication(null);
    setShowApplicationModal(true);
  };

  const handleEditApplication = (application) => {
    setSelectedApplication(application);
    setShowApplicationModal(true);
  };

  const handleModalClose = () => {
    setShowCompetitionModal(false);
    setShowApplicationModal(false);
    setSelectedCompetition(null);
    setSelectedApplication(null);
    loadData(); // Refresh data after modal closes
  };

  const filteredCompetitions = competitions.filter(competition => {
    const nameMatch = competition.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const orgMatch = competition.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    const statusMatch = statusFilter === 'all' || competition.status === statusFilter;
    return (nameMatch || orgMatch) && statusMatch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      case 'awarded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasPermission('competitions.view')) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Competitions</h1>
          <p className="text-gray-600 mt-1">Manage grant applications and funding opportunities</p>
        </div>
        {hasPermission('competitions.create') && (
          <button
            onClick={handleCreateCompetition}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus size={20} />
            New Competition
          </button>
        )}
      </div>

      {metrics && <CompetitionMetrics metrics={metrics} />}

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'competitions', label: 'Competitions', icon: Trophy },
            { id: 'applications', label: 'Applications', icon: FileText }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Competitions</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.activeCompetitions || 0}</p>
                </div>
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.totalApplications || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Success Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.successRate?.toFixed(1) || 0}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Upcoming Deadlines</p>
                  <p className="text-2xl font-bold text-gray-900">{metrics?.upcomingDeadlines || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              {applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.slice(0, 5).map((application) => (
                    <div key={application.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">
                          Application for {competitions.find(c => c.id === application.competitionId)?.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {application.createdAt?.toDate ? format(application.createdAt.toDate(), 'MMM d, yyyy') : 'Date not available'}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status.replace('_', ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No recent activity</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'competitions' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search competitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
              <option value="awarded">Awarded</option>
            </select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((competition) => (
              <CompetitionCard
                key={competition.id}
                competition={competition}
                onEdit={() => handleEditCompetition(competition)}
                onCreateApplication={() => handleCreateApplication(competition)}
                canEdit={hasPermission('competitions.edit')}
                canCreateApplication={hasPermission('competitions.manageApplications')}
              />
            ))}
          </div>

          {filteredCompetitions.length === 0 && (
            <div className="text-center py-12">
              <Trophy className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No competitions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters'
                  : 'Get started by creating a new competition'
                }
              </p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'applications' && (
        <div className="space-y-6">
          {/* Applications Table */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">All Applications</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Competition
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications.map((application) => {
                    const competition = competitions.find(c => c.id === application.competitionId);
                    return (
                      <tr key={application.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {competition?.name || 'Unknown Competition'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {competition?.organization || 'Unknown Organization'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Project ID: {application.projectId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {application.submittedAt?.toDate
                            ? format(application.submittedAt.toDate(), 'MMM d, yyyy')
                            : 'Not submitted'
                          }
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {hasPermission('competitions.manageApplications') && (
                            <button
                              onClick={() => handleEditApplication(application)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCompetitionModal && (
        <CompetitionModal
          isOpen={showCompetitionModal}
          onClose={handleModalClose}
          competition={selectedCompetition}
        />
      )}

      {showApplicationModal && (
        <ApplicationModal
          isOpen={showApplicationModal}
          onClose={handleModalClose}
          application={selectedApplication}
          competition={selectedCompetition}
        />
      )}
    </div>
  );
};

export default Competitions; 