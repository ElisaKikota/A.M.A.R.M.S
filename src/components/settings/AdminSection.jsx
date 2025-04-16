import React, { useState, useEffect } from 'react';
import { Database, Trash2, AlertCircle, Lock, RefreshCw, Eye, Plus, Download, FileText, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { collection, getDocs, deleteDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';
import initializeDatabase from '../../firebase/initializeDatabase';

const AdminSection = () => {
  const [loading, setLoading] = useState(false);
  const [collectionsLoading, setCollectionsLoading] = useState(true);
  const [authorizationCode, setAuthorizationCode] = useState('');
  const [showAuthorizationModal, setShowAuthorizationModal] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [collections, setCollections] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [collectionDocuments, setCollectionDocuments] = useState([]);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const [documentData, setDocumentData] = useState('');
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [exportFormat, setExportFormat] = useState('json');

  // Load collections when component mounts
  useEffect(() => {
    loadCollections();
  }, []);

  // Load available collections
  const loadCollections = async () => {
    try {
      setCollectionsLoading(true);
      // Include all collections from the Firebase screenshot
      const commonCollections = [
        'activities',
        'authorization',
        'bookings',
        'borrowings',
        'hardware',
        'hardwareBorrows',
        'hardwareCategories',
        'hardwareHistory',
        'hardwareResources',
        'projects',
        'resourceHistory',
        'resources',
        'reviews',
        'roles',
        'software',
        'softwareCategories',
        'softwareHistory',
        'softwareResources',
        'submissions',
        'supervisorMeetingApproval',
        'taskSubmissions',
        'tasks',
        'team',
        'trainingGroups',
        'trainingTasks',
        'user',
        'users',
        'notifications',
        'settings'
      ];
      
      // Verify which collections actually exist and have documents
      const existingCollections = [];
      
      for (const collName of commonCollections) {
        try {
          const collRef = collection(db, collName);
          const snapshot = await getDocs(collRef);
          
          if (!snapshot.empty || snapshot.size > 0) {
            existingCollections.push(collName);
          }
        } catch (err) {
          console.log(`Collection ${collName} check failed:`, err);
        }
      }
      
      setCollections(existingCollections.length > 0 ? existingCollections : commonCollections);
    } catch (error) {
      console.error('Error loading collections:', error);
      toast.error('Failed to load collections');
      // Fallback to common collections in case of error
      setCollections(['users', 'projects', 'tasks', 'activities', 'roles']);
    } finally {
      setCollectionsLoading(false);
    }
  };

  // Handle database initialization
  const handleInitializeDatabase = async () => {
    if (!authorizationCode) {
      toast.error('Please enter the authorization code');
      return;
    }

    try {
      setLoading(true);
      await initializeDatabase();
      toast.success('Database initialized successfully');
      // Refresh collections after initialization
      loadCollections();
    } catch (error) {
      console.error('Error initializing database:', error);
      toast.error('Failed to initialize database');
    } finally {
      setLoading(false);
      setShowAuthorizationModal(false);
      setAuthorizationCode('');
    }
  };

  // Handle collection deletion
  const handleDeleteCollection = async (collectionName) => {
    if (!authorizationCode) {
      toast.error('Please enter the authorization code');
      return;
    }

    try {
      setLoading(true);
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      // Delete all documents in the collection
      const deletePromises = snapshot.docs.map(document => deleteDoc(document.ref));
      await Promise.all(deletePromises);
      
      toast.success(`Collection '${collectionName}' deleted successfully`);
      // Refresh collections after deletion
      loadCollections();
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection');
    } finally {
      setLoading(false);
      setShowAuthorizationModal(false);
      setAuthorizationCode('');
    }
  };

  // Show authorization modal for dangerous actions
  const showAuthorization = (action) => {
    setSelectedAction(action);
    setShowAuthorizationModal(true);
  };

  // Handle action confirmation
  const handleConfirmAction = () => {
    if (selectedAction === 'initialize') {
      handleInitializeDatabase();
    } else if (selectedAction.startsWith('delete:')) {
      const collectionName = selectedAction.split(':')[1];
      handleDeleteCollection(collectionName);
    }
  };

  // Load documents from a collection
  const loadDocuments = async (collectionName) => {
    try {
      setLoading(true);
      setSelectedCollection(collectionName);
      
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        data: doc.data()
      }));
      
      setCollectionDocuments(documents);
      setShowDocumentModal(true);
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  // Handle exporting a collection
  const handleExportCollection = async (collectionName) => {
    try {
      setLoading(true);
      
      const collectionRef = collection(db, collectionName);
      const snapshot = await getDocs(collectionRef);
      
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Format data based on the selected format
      let exportData;
      let fileExtension;
      let contentType;
      
      if (exportFormat === 'json') {
        exportData = JSON.stringify(documents, null, 2);
        fileExtension = 'json';
        contentType = 'application/json';
      } else if (exportFormat === 'csv') {
        // Simple CSV conversion (might not work well for nested objects)
        if (documents.length > 0) {
          const headers = Object.keys(documents[0]).filter(key => key !== 'id');
          const csvRows = [
            ['id', ...headers].join(','),
            ...documents.map(doc => [
              doc.id,
              ...headers.map(header => {
                const value = doc[header];
                return typeof value === 'object' ? JSON.stringify(value) : value;
              })
            ].join(','))
          ];
          exportData = csvRows.join('\n');
        } else {
          exportData = 'No data';
        }
        fileExtension = 'csv';
        contentType = 'text/csv';
      }
      
      // Create a blob and download
      const blob = new Blob([exportData], { type: contentType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${collectionName}.${fileExtension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Collection '${collectionName}' exported successfully`);
    } catch (error) {
      console.error('Error exporting collection:', error);
      toast.error('Failed to export collection');
    } finally {
      setLoading(false);
    }
  };

  // Handle creating a new collection
  const handleCreateCollection = async () => {
    if (!newCollectionName.trim()) {
      toast.error('Please enter a collection name');
      return;
    }
    
    try {
      setLoading(true);
      // In Firestore, collections are created when you add a document
      // We'll add a placeholder document
      const collectionRef = collection(db, newCollectionName);
      await addDoc(collectionRef, {
        created: new Date(),
        description: 'Placeholder document for new collection'
      });
      
      toast.success(`Collection '${newCollectionName}' created successfully`);
      setShowNewCollectionModal(false);
      setNewCollectionName('');
      
      // Refresh collections
      loadCollections();
    } catch (error) {
      console.error('Error creating collection:', error);
      toast.error('Failed to create collection');
    } finally {
      setLoading(false);
    }
  };

  // Handle adding a new document to a collection
  const handleAddDocument = async () => {
    if (!selectedCollection) return;
    
    try {
      setLoading(true);
      // Parse the document data
      let data;
      try {
        data = JSON.parse(documentData);
      } catch (e) {
        toast.error('Invalid JSON format');
        setLoading(false);
        return;
      }
      
      // Add the document to the collection
      const collectionRef = collection(db, selectedCollection);
      await addDoc(collectionRef, data);
      
      toast.success('Document added successfully');
      
      // Refresh the documents
      loadDocuments(selectedCollection);
    } catch (error) {
      console.error('Error adding document:', error);
      toast.error('Failed to add document');
    } finally {
      setLoading(false);
      setDocumentData('');
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold flex items-center gap-2">
        <Database className="w-5 h-5" />
        Database Management
      </h3>

      <div className="space-y-4">
        {/* Initialize Database */}
        <div className="bg-white p-4 rounded-lg border">
          <h4 className="font-medium mb-2">Initialize Database</h4>
          <p className="text-sm text-gray-600 mb-4">
            Reset the database by deleting all data from collections except authorization codes and roles.
            This action will remove all projects, tasks, users, activities, and other application data.
          </p>
          <button
            onClick={() => showAuthorization('initialize')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4" />
            Initialize Database
          </button>
        </div>

        {/* Collection Management */}
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-medium">Collection Management</h4>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowNewCollectionModal(true)}
                className="p-1 text-blue-600 hover:text-blue-800 rounded-full"
                title="Create New Collection"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button 
                onClick={loadCollections}
                className="p-1 text-gray-500 hover:text-blue-600 rounded-full"
                disabled={collectionsLoading}
                title="Refresh collections"
              >
                <RefreshCw className={`w-4 h-4 ${collectionsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Manage individual collections in the database.
          </p>
          
          {/* Export Format Selection */}
          <div className="mb-4 bg-gray-50 p-3 rounded-lg flex items-center justify-between">
            <span className="text-sm text-gray-600">Export Format:</span>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="exportFormat"
                  value="json"
                  checked={exportFormat === 'json'}
                  onChange={() => setExportFormat('json')}
                  className="form-radio"
                />
                <span className="text-sm">JSON</span>
              </label>
              <label className="flex items-center gap-1">
                <input
                  type="radio"
                  name="exportFormat"
                  value="csv"
                  checked={exportFormat === 'csv'}
                  onChange={() => setExportFormat('csv')}
                  className="form-radio"
                />
                <span className="text-sm">CSV</span>
              </label>
            </div>
          </div>
          
          {collectionsLoading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : collections.length === 0 ? (
            <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
              No collections found
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map(collectionName => (
                <div key={collectionName} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{collectionName}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => loadDocuments(collectionName)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="View Documents"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleExportCollection(collectionName)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                      title={`Export as ${exportFormat.toUpperCase()}`}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => showAuthorization(`delete:${collectionName}`)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Authorization Modal */}
      {showAuthorizationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">Authorization Required</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please enter the authorization code to confirm this action.
            </p>
            <input
              type="password"
              value={authorizationCode}
              onChange={(e) => setAuthorizationCode(e.target.value)}
              placeholder="Enter authorization code"
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAuthorizationModal(false);
                  setAuthorizationCode('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={loading || !authorizationCode}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocumentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">
                Documents in <span className="text-blue-600">{selectedCollection}</span>
              </h3>
              <button 
                onClick={() => setShowDocumentModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="mb-4">
                <h4 className="font-medium mb-2">Add New Document</h4>
                <div className="flex gap-2">
                  <textarea
                    value={documentData}
                    onChange={(e) => setDocumentData(e.target.value)}
                    placeholder='Enter JSON data (e.g., {"name": "value"})'
                    className="w-full px-3 py-2 border rounded-lg font-mono text-sm"
                    rows={3}
                  />
                  <button
                    onClick={handleAddDocument}
                    disabled={loading || !documentData}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h4 className="font-medium mb-2">Existing Documents ({collectionDocuments.length})</h4>
              {collectionDocuments.length === 0 ? (
                <div className="p-4 text-center text-gray-500 bg-gray-50 rounded-lg">
                  No documents found in this collection
                </div>
              ) : (
                <div className="space-y-3">
                  {collectionDocuments.map((doc) => (
                    <div key={doc.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-sm text-blue-600 mb-1">
                        {doc.id}
                      </div>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(doc.data, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* New Collection Modal */}
      {showNewCollectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-blue-500" />
              <h3 className="font-semibold">Create New Collection</h3>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Enter a name for the new collection. A placeholder document will be created.
            </p>
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="w-full px-3 py-2 border rounded-lg mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowNewCollectionModal(false);
                  setNewCollectionName('');
                }}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCollection}
                disabled={loading || !newCollectionName.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSection; 