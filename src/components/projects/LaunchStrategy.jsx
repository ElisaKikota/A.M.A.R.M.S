import React, { useState, useEffect, useCallback } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { 
  ChevronDown, 
  ChevronUp, 
  Edit2, 
  Trash2, 
  
  
  
  Target,
  Radio,
  CheckCircle,
  Clock,
  
  X,
  
  Share2,
  Plus,
  
  Users,
  FileText,
  Calendar,
  MessageSquare,
  UserPlus,
  
  
  
  AlertOctagon,
  ExternalLink,
  BarChart2
  
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { firebaseDb } from '../../services/firebaseDb';

import SocialMediaTracker, { SOCIAL_MEDIA_PLATFORMS } from './SocialMediaTracker';

const STATUS_COLORS = {
  'Not Started': 'bg-gray-200 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Completed': 'bg-green-100 text-green-700'
};

const STATUS_ICONS = {
  'Not Started': Clock,
  'In Progress': Radio,
  'Completed': CheckCircle
};

const DEFAULT_PLATFORMS = ['instagram', 'twitter', 'youtube', 'tiktok'];

// Rich Text Editor Modal Component
const RichTextEditorModal = ({ isOpen, onClose, initialValue, onSave, title, isNewItem, isExecutionItem = false, projectFiles = [], project }) => {
  const [content, setContent] = useState(initialValue?.description || '');
  const [itemTitle, setItemTitle] = useState(initialValue?.title || '');
  const [status, setStatus] = useState(initialValue?.status || 'Not Started');
  const [dueDate, setDueDate] = useState(initialValue?.dueDate || '');
  const [selectedFiles, setSelectedFiles] = useState(initialValue?.evidence || []);
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState([]);

  // Reset form when initialValue changes
  useEffect(() => {
    if (initialValue) {
      setContent(initialValue.description || '');
      setItemTitle(initialValue.title || '');
      setStatus(initialValue.status || 'Not Started');
      setDueDate(initialValue.dueDate || '');
      setSelectedFiles(initialValue.evidence || []);
    }
  }, [initialValue]);

  // Load documents from Firebase if needed
  const loadDocumentsFromFirebase = useCallback(async () => {
    if (!project?.id) return;
    
    setLoading(true);
    try {
      const projectDocs = await firebaseDb.getProjectDocuments(project.id);
      if (projectDocs && Array.isArray(projectDocs)) {
        setDocuments(projectDocs);
      } else {
        setDocuments([]);
      }
    } catch (error) {
      console.error('Error loading documents:', error);
      toast.error('Failed to load documents');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, [project?.id]);

  useEffect(() => {
    if (isOpen) {
      if (projectFiles && projectFiles.length > 0) {
        setDocuments(projectFiles);
        setLoading(false);
      } else {
        loadDocumentsFromFirebase();
      }
    }
  }, [isOpen, projectFiles, loadDocumentsFromFirebase]);

  if (!isOpen) return null;

  const handleEvidenceToggle = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{isNewItem ? 'Add New Item' : 'Edit Item'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              type="text"
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="Enter title..."
            />
          </div>

          {!isExecutionItem && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            {isExecutionItem ? (
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-3 py-2 border rounded-md min-h-[100px]"
                placeholder="Enter a brief description..."
              />
            ) : (
              <Editor
                apiKey="iw5wisrvzpunj30czx7i6q4tysf9zpzipxfmmhm5ut2ikwyv"
                value={content}
                onEditorChange={(newContent) => setContent(newContent)}
                init={{
                  height: 400,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                }}
              />
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Evidence of Work
              <span className="text-xs text-gray-500 font-normal ml-1">(Select files or links as evidence)</span>
            </label>
            <div className="max-h-32 overflow-y-auto border rounded-lg divide-y">
              {loading ? (
                <div className="flex justify-center items-center p-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                </div>
              ) : documents.length === 0 ? (
                <div className="text-sm text-gray-500 p-3 text-center">
                  No documents available. Add files in the Documents tab first.
                </div>
              ) : (
                <div>
                  {documents.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleEvidenceToggle(file.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={() => handleEvidenceToggle(file.id)}
                        className="h-4 w-4 text-blue-600 rounded border-gray-300"
                      />
                      {file.type === 'link' ? (
                        <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                      ) : (
                        <FileText size={14} className="text-gray-400 flex-shrink-0" />
                      )}
                      <span className="text-sm truncate flex-1">{file.name}</span>
                      {selectedFiles.includes(file.id) && (
                        <CheckCircle size={14} className="text-blue-600 flex-shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave({
                title: itemTitle,
                description: content,
                status: isExecutionItem ? 'In Progress' : status,
                dueDate,
                evidence: selectedFiles,
                lastUpdated: new Date().toISOString()
              });
              onClose();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

const StrategySection = ({ title, icon: Icon, items, onAdd, onEdit, onDelete, onAttachFile, editMode, projectFiles, specSection, isExecutionSection = false, project }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);
  const [currentEditItem, setCurrentEditItem] = useState(null);

  // Check if the content is from specifications
  const isFromSpecifications = items.length > 0 && items[0]?.title === "From Specifications";

  const handleAdd = () => {
    setCurrentEditItem(null);
    setIsEditorOpen(true);
  };

  const handleEdit = (itemIndex, item) => {
    setCurrentEditItem({
      ...item,
      // Ensure evidence array is included
      evidence: item.evidence || []
    });
    setSelectedItemIndex(itemIndex);
    setIsEditorOpen(true);
  };

  const getFileDetails = (fileId) => {
    return projectFiles.find(file => file.id === fileId);
  };

  const getStatusIcon = (status) => {
    const IconComponent = STATUS_ICONS[status];
    return <IconComponent size={16} className="mr-2" />;
  };

  return (
    <div className="border rounded-md overflow-hidden relative">
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Icon size={20} className="text-gray-500" />
          <h3 className="font-semibold text-gray-700">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {/* For execution sections: Show Add button only when empty, and Edit button only when it has content */}
          {editMode && !isFromSpecifications && (
            isExecutionSection ? (
              items.length === 0 ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAdd();
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  title="Add Item"
                >
                  <Plus size={16} />
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(0, items[0]);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
              )
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAdd();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Add Item"
              >
                <Plus size={16} />
              </button>
            )
          )}
          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-4">
          {items.length > 0 ? (
            isExecutionSection ? (
              // Single item display for execution sections - no card wrapper
              <div>
                {/* Description */}
                <div 
                  className="text-sm text-gray-600 prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: items[0].description }}
                />
                
                {/* Due date if available */}
                {items[0].dueDate && (
                  <div className="mt-2 text-xs text-gray-500">
                    Due: {new Date(items[0].dueDate).toLocaleDateString()}
                  </div>
                )}
                
                {/* Attached Files */}
                {items[0].evidence && items[0].evidence.length > 0 && (
                  <div className="mt-3">
                    <div className="text-xs font-medium text-gray-500 mb-1">Attached Files:</div>
                    <div className="flex flex-col gap-1">
                      {items[0].evidence.map(fileId => {
                        const file = getFileDetails(fileId);
                        if (!file) return null;
                        
                        return (
                          <div key={fileId} className="flex items-center gap-2 bg-gray-100 px-2 py-1.5 rounded-md text-xs">
                            {file.type === 'link' ? (
                              <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                            ) : (
                              <FileText size={14} className="text-gray-400 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium text-gray-700">{file.name}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Multiple items display for non-execution sections
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="border rounded-md p-3 bg-white">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        {/* Only show status for non-specification items and non-execution items */}
                        {!isFromSpecifications && !isExecutionSection && (
                          <div className={`px-2 py-1 text-xs rounded-full ${STATUS_COLORS[item.status]}`}>
                            {getStatusIcon(item.status)} {item.status}
                          </div>
                        )}
                        {/* Hide "From Specifications" title */}
                        {item.title !== "From Specifications" && (
                          <h4 className="font-medium">{item.title}</h4>
                        )}
                      </div>
                      {/* Only show edit/delete buttons if not from specifications */}
                      {editMode && !isFromSpecifications && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(index, item)}
                            className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => onDelete(index)}
                            className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className="text-sm text-gray-600 prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                    
                    {/* Due date if available */}
                    {item.dueDate && (
                      <div className="mt-2 text-xs text-gray-500">
                        Due: {new Date(item.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    
                    {/* Attached Files */}
                    {item.evidence && item.evidence.length > 0 && (
                      <div className="mt-3">
                        <div className="text-xs font-medium text-gray-500 mb-1">Attached Files:</div>
                        <div className="flex flex-col gap-1">
                          {item.evidence.map(fileId => {
                            const file = getFileDetails(fileId);
                            if (!file) return null;
                            
                            return (
                              <div key={fileId} className="flex items-center gap-2 bg-gray-100 px-2 py-1.5 rounded-md text-xs">
                                {file.type === 'link' ? (
                                  <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
                                ) : (
                                  <FileText size={14} className="text-gray-400 flex-shrink-0" />
                                )}
                                <span className="text-sm font-medium text-gray-700">{file.name}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            <div className="text-center text-gray-500 py-4">
              {editMode 
                ? isExecutionSection
                  ? "Click the + button to add an item."
                  : "No items added yet. Click the + button to add one."
                : "No content available. Add information in the Specifications section first."}
            </div>
          )}
        </div>
      )}

      <RichTextEditorModal
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setCurrentEditItem(null);
        }}
        initialValue={currentEditItem}
        isNewItem={currentEditItem === null}
        isExecutionItem={isExecutionSection}
        projectFiles={projectFiles}
        project={project}
        onSave={(item) => {
          if (currentEditItem === null) {
            onAdd(item);
          } else {
            onEdit(selectedItemIndex, item);
          }
          setIsEditorOpen(false);
          setCurrentEditItem(null);
        }}
      />
    </div>
  );
};

const LaunchStrategy = ({ project, onUpdate }) => {
  
  






















  

  // Function to convert specification string content to strategy item format
  const convertSpecToStrategyItem = (content) => {
    // If content is empty, falsy, or just whitespace/HTML tags, return empty array
    if (!content || content.trim() === '' || content.replace(/<[^>]*>?/gm, '').trim() === '') {
      return [];
    }
    
    return [{
      title: "From Specifications",
      description: content,
      status: "Completed",
      lastUpdated: new Date().toISOString()
    }];
  };

  // Get initial strategy state
  const getInitialStrategy = useCallback(() => {
    // For planning section, use data from specifications if available
    const specs = project?.specifications || {};
    const problemSection = specs.problem || {};
    
    return {
      planning: {
        problemStatement: problemSection.statement ? 
          convertSpecToStrategyItem(problemSection.statement) : 
          (project.launchStrategy?.planning?.problemStatement || []),
        
        mainObjective: problemSection.mainObjective ? 
          convertSpecToStrategyItem(problemSection.mainObjective) : 
          (project.launchStrategy?.planning?.mainObjective || []),
        
        specificObjectives: problemSection.specificObjectives ? 
          convertSpecToStrategyItem(problemSection.specificObjectives) : 
          (project.launchStrategy?.planning?.specificObjectives || []),
        
        targetAudience: problemSection.targetAudience ? 
          convertSpecToStrategyItem(problemSection.targetAudience) : 
          (project.launchStrategy?.planning?.targetAudience || [])
      },
      execution: {
        promotion: {
          advertising: project.launchStrategy?.execution?.promotion?.advertising || [],
          socialMedia: project.launchStrategy?.execution?.promotion?.socialMedia || [],
          influencerPartnerships: project.launchStrategy?.execution?.promotion?.influencerPartnerships || [],
          pressReleases: project.launchStrategy?.execution?.promotion?.pressReleases || []
        },
        launchDay: {
          eventCoordination: project.launchStrategy?.execution?.launchDay?.eventCoordination || [],
          finalAnnouncements: project.launchStrategy?.execution?.launchDay?.finalAnnouncements || [],
          userOnboarding: project.launchStrategy?.execution?.launchDay?.userOnboarding || []
        }
      },
      socialMedia: {
        activePlatforms: project.launchStrategy?.socialMedia?.activePlatforms || DEFAULT_PLATFORMS,
        platforms: project.launchStrategy?.socialMedia?.platforms || {}
      }
    };
  }, [project]);

  const [strategy, setStrategy] = useState(getInitialStrategy());
  const [activeTab, setActiveTab] = useState('strategy');
  const [showPlatformModal, setShowPlatformModal] = useState(false);

  // Update strategy when project specifications change
  useEffect(() => {
    // Detect if specifications have changed
    const newStrategy = getInitialStrategy();
    
    // Check if planning section has changed from specifications
    const planningHasChanges = Object.keys(newStrategy.planning).some(key => {
      const currentItems = strategy.planning[key];
      const newItems = newStrategy.planning[key];
      
      // If array lengths differ, there's a change
      if (currentItems.length !== newItems.length) {
        return true;
      }
      
      // If there are items and the first item is from specifications
      if (newItems.length > 0 && newItems[0].title === "From Specifications") {
        // Content from specifications might have changed
        return currentItems.length === 0 || 
          currentItems[0].title !== "From Specifications" ||
          currentItems[0].description !== newItems[0].description;
      }
      
      return false;
    });
    
    if (planningHasChanges) {
      setStrategy(currentStrategy => ({
        ...currentStrategy,
        planning: newStrategy.planning
      }));
    }
  }, [project?.specifications, getInitialStrategy, strategy.planning]);

  const handleAdd = (phase, section, subsection, item) => {
    const updatedStrategy = { ...strategy };
    if (subsection) {
      updatedStrategy[phase][section][subsection] = [
        ...updatedStrategy[phase][section][subsection],
        item
      ];
    } else {
      updatedStrategy[phase][section] = [
        ...updatedStrategy[phase][section],
        item
      ];
    }
    setStrategy(updatedStrategy);
    onUpdate(updatedStrategy);
  };

  const handleEdit = (phase, section, subsection, index, item) => {
    const updatedStrategy = { ...strategy };
    if (subsection) {
      updatedStrategy[phase][section][subsection] = updatedStrategy[phase][section][subsection].map(
        (i, idx) => idx === index ? item : i
      );
    } else {
      updatedStrategy[phase][section] = updatedStrategy[phase][section].map(
        (i, idx) => idx === index ? item : i
      );
    }
    setStrategy(updatedStrategy);
    onUpdate(updatedStrategy);
  };

  const handleDelete = (phase, section, subsection, index) => {
    const updatedStrategy = { ...strategy };
    if (subsection) {
      updatedStrategy[phase][section][subsection] = updatedStrategy[phase][section][subsection].filter(
        (_, idx) => idx !== index
      );
    } else {
      updatedStrategy[phase][section] = updatedStrategy[phase][section].filter(
        (_, idx) => idx !== index
      );
    }
    setStrategy(updatedStrategy);
    onUpdate(updatedStrategy);
  };

  const handleAttachFile = (phase, section, subsection, index, evidence) => {
    const updatedStrategy = { ...strategy };
    if (subsection) {
      updatedStrategy[phase][section][subsection] = updatedStrategy[phase][section][subsection].map(
        (item, idx) => idx === index ? { ...item, evidence } : item
      );
    } else {
      updatedStrategy[phase][section] = updatedStrategy[phase][section].map(
        (item, idx) => idx === index ? { ...item, evidence } : item
      );
    }
    setStrategy(updatedStrategy);
    onUpdate(updatedStrategy);
  };

  const handleUpdateSocialMedia = (platform, data) => {
    const updatedStrategy = {
      ...strategy,
      socialMedia: {
        ...strategy.socialMedia,
        platforms: {
          ...strategy.socialMedia.platforms,
          [platform]: data
        }
      }
    };
    setStrategy(updatedStrategy);
    onUpdate(updatedStrategy);
  };

  const handleAddPlatform = (platform) => {
    if (!strategy.socialMedia.activePlatforms.includes(platform)) {
      const updatedStrategy = {
        ...strategy,
        socialMedia: {
          ...strategy.socialMedia,
          activePlatforms: [...strategy.socialMedia.activePlatforms, platform]
        }
      };
      setStrategy(updatedStrategy);
      onUpdate(updatedStrategy);
    }
    setShowPlatformModal(false);
  };

  const handleRemovePlatform = (platform) => {
    const updatedStrategy = {
      ...strategy,
      socialMedia: {
        ...strategy.socialMedia,
        activePlatforms: strategy.socialMedia.activePlatforms.filter(p => p !== platform)
      }
    };
    setStrategy(updatedStrategy);
    onUpdate(updatedStrategy);
  };

  const tabs = [
    { id: 'strategy', label: 'Strategy Overview', icon: Target },
    { id: 'social', label: 'Social Media Tracking', icon: BarChart2 }
  ];

  return (
    <div className="space-y-6">
      {/* Tab Navigation - Similar to Specifications style */}
      <div className="flex space-x-1 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 bg-blue-50 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="space-y-6">
        {activeTab === 'strategy' ? (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">1. Planning & Research</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                <StrategySection
                  title="Problem Statement"
                  icon={AlertOctagon}
                  items={strategy.planning.problemStatement}
                  onAdd={(item) => handleAdd('planning', 'problemStatement', null, item)}
                  onEdit={(index, item) => handleEdit('planning', 'problemStatement', null, index, item)}
                  onDelete={(index) => handleDelete('planning', 'problemStatement', null, index)}
                  onAttachFile={(index, evidence) => handleAttachFile('planning', 'problemStatement', null, index, evidence)}
                  editMode={project?.specifications?.problem?.statement ? false : true}
                  projectFiles={project?.documents || []}
                  specSection="Problem Statement → Problem Statement"
                  project={project}
                />

                <StrategySection
                  title="Main Objective"
                  icon={Target}
                  items={strategy.planning.mainObjective}
                  onAdd={(item) => handleAdd('planning', 'mainObjective', null, item)}
                  onEdit={(index, item) => handleEdit('planning', 'mainObjective', null, index, item)}
                  onDelete={(index) => handleDelete('planning', 'mainObjective', null, index)}
                  onAttachFile={(index, evidence) => handleAttachFile('planning', 'mainObjective', null, index, evidence)}
                  editMode={project?.specifications?.problem?.mainObjective ? false : true}
                  projectFiles={project?.documents || []}
                  specSection="Problem Statement → Main Objective"
                  project={project}
                />

                <StrategySection
                  title="Specific Objectives"
                  icon={CheckCircle}
                  items={strategy.planning.specificObjectives}
                  onAdd={(item) => handleAdd('planning', 'specificObjectives', null, item)}
                  onEdit={(index, item) => handleEdit('planning', 'specificObjectives', null, index, item)}
                  onDelete={(index) => handleDelete('planning', 'specificObjectives', null, index)}
                  onAttachFile={(index, evidence) => handleAttachFile('planning', 'specificObjectives', null, index, evidence)}
                  editMode={project?.specifications?.problem?.specificObjectives ? false : true}
                  projectFiles={project?.documents || []}
                  specSection="Problem Statement → Specific Objectives"
                  project={project}
                />

                <StrategySection
                  title="Target Audience"
                  icon={Users}
                  items={strategy.planning.targetAudience}
                  onAdd={(item) => handleAdd('planning', 'targetAudience', null, item)}
                  onEdit={(index, item) => handleEdit('planning', 'targetAudience', null, index, item)}
                  onDelete={(index) => handleDelete('planning', 'targetAudience', null, index)}
                  onAttachFile={(index, evidence) => handleAttachFile('planning', 'targetAudience', null, index, evidence)}
                  editMode={project?.specifications?.problem?.targetAudience ? false : true}
                  projectFiles={project?.documents || []}
                  specSection="Problem Statement → Target Audience"
                  project={project}
                />
              </div>
            </div>

            {/* Execution Phase */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">2. Execution</h2>
              
              {/* Promotion Phase */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Promotion Phase (1 month)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StrategySection
                    title="Advertising & Outreach"
                    icon={Target}
                    items={strategy.execution.promotion.advertising}
                    onAdd={(item) => handleAdd('execution', 'promotion', 'advertising', item)}
                    onEdit={(index, item) => handleEdit('execution', 'promotion', 'advertising', index, item)}
                    onDelete={(index) => handleDelete('execution', 'promotion', 'advertising', index)}
                    onAttachFile={(index, evidence) => handleAttachFile('execution', 'promotion', 'advertising', index, evidence)}
                    editMode={true}
                    projectFiles={project?.documents || []}
                    specSection="Specifications section"
                    isExecutionSection={true}
                    project={project}
                  />

                  <StrategySection
                    title="Social Media Campaigns"
                    icon={Share2}
                    items={strategy.execution.promotion.socialMedia}
                    onAdd={(item) => handleAdd('execution', 'promotion', 'socialMedia', item)}
                    onEdit={(index, item) => handleEdit('execution', 'promotion', 'socialMedia', index, item)}
                    onDelete={(index) => handleDelete('execution', 'promotion', 'socialMedia', index)}
                    onAttachFile={(index, evidence) => handleAttachFile('execution', 'promotion', 'socialMedia', index, evidence)}
                    editMode={true}
                    projectFiles={project?.documents || []}
                    specSection="Specifications section"
                    isExecutionSection={true}
                    project={project}
                  />

                  <StrategySection
                    title="Influencer Partnerships"
                    icon={Users}
                    items={strategy.execution.promotion.influencerPartnerships}
                    onAdd={(item) => handleAdd('execution', 'promotion', 'influencerPartnerships', item)}
                    onEdit={(index, item) => handleEdit('execution', 'promotion', 'influencerPartnerships', index, item)}
                    onDelete={(index) => handleDelete('execution', 'promotion', 'influencerPartnerships', index)}
                    onAttachFile={(index, evidence) => handleAttachFile('execution', 'promotion', 'influencerPartnerships', index, evidence)}
                    editMode={true}
                    projectFiles={project?.documents || []}
                    specSection="Specifications section"
                    isExecutionSection={true}
                    project={project}
                  />

                  <StrategySection
                    title="Press Releases"
                    icon={FileText}
                    items={strategy.execution.promotion.pressReleases}
                    onAdd={(item) => handleAdd('execution', 'promotion', 'pressReleases', item)}
                    onEdit={(index, item) => handleEdit('execution', 'promotion', 'pressReleases', index, item)}
                    onDelete={(index) => handleDelete('execution', 'promotion', 'pressReleases', index)}
                    onAttachFile={(index, evidence) => handleAttachFile('execution', 'promotion', 'pressReleases', index, evidence)}
                    editMode={true}
                    projectFiles={project?.documents || []}
                    specSection="Specifications section"
                    isExecutionSection={true}
                    project={project}
                  />
                </div>
              </div>

              {/* Launch Day Activities */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-800">Launch Day Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <StrategySection
                    title="Event Coordination"
                    icon={Calendar}
                    items={strategy.execution.launchDay.eventCoordination}
                    onAdd={(item) => handleAdd('execution', 'launchDay', 'eventCoordination', item)}
                    onEdit={(index, item) => handleEdit('execution', 'launchDay', 'eventCoordination', index, item)}
                    onDelete={(index) => handleDelete('execution', 'launchDay', 'eventCoordination', index)}
                    onAttachFile={(index, evidence) => handleAttachFile('execution', 'launchDay', 'eventCoordination', index, evidence)}
                    editMode={true}
                    projectFiles={project?.documents || []}
                    specSection="Specifications section"
                    isExecutionSection={true}
                    project={project}
                  />

                  <StrategySection
                    title="Final Announcements"
                    icon={MessageSquare}
                    items={strategy.execution.launchDay.finalAnnouncements}
                    onAdd={(item) => handleAdd('execution', 'launchDay', 'finalAnnouncements', item)}
                    onEdit={(index, item) => handleEdit('execution', 'launchDay', 'finalAnnouncements', index, item)}
                    onDelete={(index) => handleDelete('execution', 'launchDay', 'finalAnnouncements', index)}
                    onAttachFile={(index, evidence) => handleAttachFile('execution', 'launchDay', 'finalAnnouncements', index, evidence)}
                    editMode={true}
                    projectFiles={project?.documents || []}
                    specSection="Specifications section"
                    isExecutionSection={true}
                    project={project}
                  />

                  <StrategySection
                    title="User Onboarding"
                    icon={UserPlus}
                    items={strategy.execution.launchDay.userOnboarding}
                    onAdd={(item) => handleAdd('execution', 'launchDay', 'userOnboarding', item)}
                    onEdit={(index, item) => handleEdit('execution', 'launchDay', 'userOnboarding', index, item)}
                    onDelete={(index) => handleDelete('execution', 'launchDay', 'userOnboarding', index)}
                    onAttachFile={(index, evidence) => handleAttachFile('execution', 'launchDay', 'userOnboarding', index, evidence)}
                    editMode={true}
                    projectFiles={project?.documents || []}
                    specSection="Specifications section"
                    isExecutionSection={true}
                    project={project}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Social Media Overview */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">Total Reach</div>
                <div className="text-2xl font-semibold">
                  {Object.values(strategy.socialMedia.platforms).reduce((total, platform) => {
                    return total + platform.posts?.reduce((sum, post) => sum + (post.metrics?.views || 0), 0) || 0;
                  }, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="text-sm text-green-600 mb-1">Total Engagement</div>
                <div className="text-2xl font-semibold">
                  {Object.values(strategy.socialMedia.platforms).reduce((total, platform) => {
                    return total + platform.posts?.reduce((sum, post) => sum + (post.metrics?.likes || 0), 0) || 0;
                  }, 0).toLocaleString()}
                </div>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="text-sm text-purple-600 mb-1">Active Platforms</div>
                <div className="text-2xl font-semibold">
                  {strategy.socialMedia.activePlatforms.length}
                </div>
              </div>
            </div>

            {/* Social Media Platforms */}
            <div className="space-y-4">
              {strategy.socialMedia.activePlatforms.map(platform => (
                <SocialMediaTracker
                  key={platform}
                  platform={platform}
                  data={strategy.socialMedia.platforms[platform]}
                  onUpdate={(data) => handleUpdateSocialMedia(platform, data)}
                  onRemove={() => handleRemovePlatform(platform)}
                  canRemove={!DEFAULT_PLATFORMS.includes(platform)}
                />
              ))}

              <button
                onClick={() => setShowPlatformModal(true)}
                className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-gray-700 hover:border-gray-400 flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Platform
              </button>
            </div>

            {/* Platform Selection Modal */}
            {showPlatformModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg w-full max-w-md p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Add Social Media Platform</h3>
                    <button
                      onClick={() => setShowPlatformModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {Object.entries(SOCIAL_MEDIA_PLATFORMS)
                      .filter(([key]) => !strategy.socialMedia.activePlatforms.includes(key))
                      .map(([key, { name, icon, color }]) => (
                        <button
                          key={key}
                          onClick={() => handleAddPlatform(key)}
                          className="w-full p-3 border rounded-lg hover:bg-gray-50 flex items-center gap-3"
                        >
                          <i className={`fab fa-${icon} ${color} text-xl`} />
                          <span className="font-medium">{name}</span>
                        </button>
                      ))}
                  </div>

                  {Object.entries(SOCIAL_MEDIA_PLATFORMS)
                    .filter(([key]) => !strategy.socialMedia.activePlatforms.includes(key))
                    .length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      All available platforms have been added
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LaunchStrategy; 