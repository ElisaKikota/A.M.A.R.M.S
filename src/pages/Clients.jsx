import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Building2, Mail, Phone, Calendar, MessageSquare } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFirebase } from '../contexts/FirebaseContext';
import { useAuth } from '../contexts/AuthContext';
import { firebaseDb } from '../services/firebaseDb';
import LoadingOverlay from '../components/ui/LoadingOverlay';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/config';
import Modal from '../components/shared/Modal';
import { Tab } from '@headlessui/react';

const Clients = () => {
  const { user } = useFirebase();
  const { hasPermission, userRole } = useAuth();
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedClient, setSelectedClient] = useState(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [projectMap, setProjectMap] = useState({});
  const [chatClient, setChatClient] = useState(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [unlinkedProjects, setUnlinkedProjects] = useState([]);
  const [selectedToLink, setSelectedToLink] = useState([]);
  const [isLinking, setIsLinking] = useState(false);

  // Check if user has permission to view clients
  const canViewClients = hasPermission('clients.view');
  const isAdminOrSupervisor = userRole === 'admin' || userRole === 'supervisor';

  useEffect(() => {
    const loadClients = async () => {
      if (!user || !canViewClients) return;
      
      try {
        setLoading(true);
        setError(null);
        // Fetch all users with role 'client'
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('role', '==', 'client'));
        const snapshot = await getDocs(q);
        const clientsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setClients(clientsData);
      } catch (error) {
        console.error('Error loading clients:', error);
        setError('Failed to load clients. Please try again.');
        toast.error('Failed to load clients');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, [user, canViewClients]);

  // Fetch projects for all clients
  useEffect(() => {
    const fetchProjectsForClients = async () => {
      try {
        const projectsRef = collection(db, 'projects');
        const snapshot = await getDocs(projectsRef);
        const allProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Map clientId to projects
        const map = {};
        allProjects.forEach(project => {
          if (project.clientId) {
            if (!map[project.clientId]) map[project.clientId] = [];
            map[project.clientId].push(project);
          }
        });
        setProjectMap(map);
      } catch (error) {
        // ignore for now
      }
    };
    fetchProjectsForClients();
  }, [clients]);

  // Fetch unlinked projects for the selected client
  useEffect(() => {
    const fetchUnlinkedProjects = async () => {
      if (!selectedClient) return;
      try {
        const projectsRef = collection(db, 'projects');
        const snapshot = await getDocs(projectsRef);
        const allProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        // Only show projects where clientIds is missing or does not include selectedClient.id
        const unlinked = allProjects.filter(
          p => !Array.isArray(p.clientIds) || !p.clientIds.includes(selectedClient.id)
        );
        setUnlinkedProjects(unlinked);
      } catch (error) {
        setUnlinkedProjects([]);
      }
    };
    if (isClientModalOpen && selectedClient) fetchUnlinkedProjects();
  }, [isClientModalOpen, selectedClient]);

  // Filter clients based on search term and status
  const filteredClients = clients.filter(client => {
    const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         client.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Fetch unassigned projects when modal opens
  const fetchAvailableProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      setAvailableProjects(
        snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(project => !project.clientId)
      );
    } catch (error) {
      setError('Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkProjectsClick = (client) => {
    setSelectedClient(client);
    setIsClientModalOpen(true);
    setSelectedProjects([]);
    fetchAvailableProjects();
  };

  const handleProjectSelect = (projectId) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleLinkProjects = async () => {
    try {
      setLoading(true);
      await Promise.all(selectedProjects.map(async (projectId) => {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { clientIds: arrayUnion(selectedClient.id) });
      }));
      toast.success('Projects linked successfully!');
      setIsClientModalOpen(false);
      setSelectedClient(null);
      setSelectedProjects([]);
    } catch (error) {
      toast.error('Failed to link projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectToLink = (projectId) => {
    setSelectedToLink(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleLinkExistingProjects = async () => {
    if (!selectedToLink.length) return;
    setIsLinking(true);
    try {
      await Promise.all(selectedToLink.map(async (projectId) => {
        const projectRef = doc(db, 'projects', projectId);
        await updateDoc(projectRef, { clientIds: arrayUnion(selectedClient.id) });
      }));
      toast.success('Projects linked successfully!');
      setSelectedToLink([]);
      // Refresh projects for clients
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      const allProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const map = {};
      allProjects.forEach(project => {
        if (project.clientIds && project.clientIds.includes(selectedClient.id)) {
          if (!map[selectedClient.id]) map[selectedClient.id] = [];
          map[selectedClient.id].push(project);
        }
      });
      setProjectMap(map);
      // Also refresh unlinked projects
      setUnlinkedProjects(allProjects.filter(
        p => !Array.isArray(p.clientIds) || !p.clientIds.includes(selectedClient.id)
      ));
    } catch (error) {
      toast.error('Failed to link projects');
    } finally {
      setIsLinking(false);
    }
  };

  // Add project for client
  const handleAddProject = async () => {
    if (!newProjectName.trim()) return;
    setIsCreatingProject(true);
    try {
      const projectData = {
        name: newProjectName,
        description: newProjectDesc,
        clientIds: [selectedClient.id],
        status: 'planning',
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, 'projects'), projectData);
      toast.success('Project created and linked!');
      setNewProjectName('');
      setNewProjectDesc('');
      setIsCreatingProject(false);
      // Refresh projects for clients
      const projectsRef = collection(db, 'projects');
      const snapshot = await getDocs(projectsRef);
      const allProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const map = {};
      allProjects.forEach(project => {
        if (project.clientIds && project.clientIds.includes(selectedClient.id)) {
          if (!map[selectedClient.id]) map[selectedClient.id] = [];
          map[selectedClient.id].push(project);
        }
      });
      setProjectMap(map);
    } catch (error) {
      toast.error('Failed to create project');
      setIsCreatingProject(false);
    }
  };

  if (!canViewClients) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">You don't have permission to view clients.</p>
      </div>
    );
  }

  if (loading) {
    return <LoadingOverlay />;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => {
          const projects = projectMap[client.id] || [];
          const projectNames = projects.slice(0, 3).map(p => p.name).join(', ');
          const moreCount = projects.length > 3 ? projects.length - 3 : 0;
          const lastMessage = client.lastMessage || 'No messages yet';
          return (
            <div
              key={client.id}
              className="bg-white rounded-lg shadow p-6 flex flex-col gap-3 cursor-pointer hover:shadow-lg hover:ring-2 hover:ring-blue-100 transition-all"
              onClick={() => { setSelectedClient(client); setIsClientModalOpen(true); }}
              tabIndex={0}
              role="button"
              aria-label={`Open details for ${client.name || client.email}`}
            >
              <div className="flex items-center gap-3">
                <div className="font-semibold text-lg">{client.name || client.email}</div>
                <span className="text-xs text-gray-500 ml-auto">Client Since: {client.createdAt ? new Date(client.createdAt.seconds ? client.createdAt.seconds * 1000 : client.createdAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div className="text-sm text-gray-600">{client.email}</div>
              <div className="mt-2">
                <span className="font-medium">Projects:</span>{' '}
                {projects.length === 0 ? (
                  <span className="text-gray-400">None</span>
                ) : (
                  <span className="text-blue-700">
                    {projectNames}{moreCount > 0 && `, +${moreCount} more`}
                  </span>
                )}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <MessageSquare size={16} className="text-gray-400" />
                <span className="text-gray-700">
                  {lastMessage}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No clients found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm ? 'Try adjusting your search or filter to find what you are looking for.' : 'Get started by adding a new client.'}
          </p>
        </div>
      )}

      {/* Client Modal with Projects and Chat */}
      <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title={`Client: ${selectedClient?.name || selectedClient?.email || ''}`}>
        {selectedClient && (
          <div>
            <div className="mb-4 text-gray-600">Email: {selectedClient.email}</div>
            <div className="mb-4">
              <span className="font-medium">Projects:</span>
            </div>
            <Tab.Group>
              <Tab.List className="flex space-x-2 border-b mb-4">
                {(projectMap[selectedClient.id] || []).map((project) => (
                  <Tab key={project.id} className={({ selected }) =>
                    `px-4 py-2 rounded-t-lg text-sm font-medium focus:outline-none ${selected ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'}`
                  }>
                    {project.name}
                  </Tab>
                ))}
                <Tab className={({ selected }) =>
                  `px-4 py-2 rounded-t-lg text-sm font-medium focus:outline-none ${selected ? 'bg-green-100 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`
                }>+ Link Existing Projects</Tab>
              </Tab.List>
              <Tab.Panels>
                {(projectMap[selectedClient.id] || []).map((project) => (
                  <Tab.Panel key={project.id} className="p-4 border rounded-b-lg bg-gray-50">
                    <div className="mb-2 font-semibold">Project: {project.name}</div>
                    <div className="text-gray-500 text-center py-8 border rounded bg-white">Chat platform coming soon. This will show messages and allow chatting with the client about this project.</div>
                  </Tab.Panel>
                ))}
                <Tab.Panel className="p-4 border rounded-b-lg bg-gray-50">
                  <div className="mb-2 font-semibold">Link Existing Projects</div>
                  {unlinkedProjects.length === 0 ? (
                    <div className="text-gray-400">No unlinked projects available.</div>
                  ) : (
                    <form onSubmit={e => { e.preventDefault(); handleLinkExistingProjects(); }} className="space-y-4">
                      <div className="max-h-64 overflow-y-auto space-y-2">
                        {unlinkedProjects.map(project => (
                          <label
                            key={project.id}
                            className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${selectedToLink.includes(project.id) ? 'bg-green-50' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={selectedToLink.includes(project.id)}
                              onChange={() => handleSelectToLink(project.id)}
                            />
                            <span>{project.name}</span>
                          </label>
                        ))}
                      </div>
                      <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" disabled={isLinking || !selectedToLink.length}>{isLinking ? 'Linking...' : 'Link Selected Projects'}</button>
                    </form>
                  )}
                </Tab.Panel>
              </Tab.Panels>
            </Tab.Group>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Clients; 