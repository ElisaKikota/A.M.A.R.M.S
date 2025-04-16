import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, ChevronRight, Edit2, Search, Paperclip, X, Link } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useFirebase } from '../../contexts/FirebaseContext';
import { Editor } from '@tinymce/tinymce-react';
import { firebaseDb } from '../../services/firebaseDb';

// Rich Text Editor Modal Component
const RichTextEditorModal = ({ isOpen, onClose, initialValue, onSave, title }) => {
  const [content, setContent] = useState(initialValue);

  // Update content when initialValue changes
  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit {title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

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
        <div className="flex justify-end mt-4 space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSave(content);
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

// File Selection Modal Component
const FileSelectionModal = ({ isOpen, onClose, onSelect, projectFiles, selectedFiles: initialSelectedFiles = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFiles, setSelectedFiles] = useState(
    // Convert initial file IDs to the format we need
    initialSelectedFiles || []
  );

  const handleSelect = () => {
    onSelect(selectedFiles);
    onClose();
  };

  // Filter available files based on search
  const filteredFiles = projectFiles?.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white rounded-lg w-full max-w-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Link Files</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search files..."
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
        </div>

        <div className="border rounded-lg max-h-96 overflow-y-auto">
          {filteredFiles.length > 0 ? (
            <div className="divide-y">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (selectedFiles.includes(file.id)) {
                      setSelectedFiles(selectedFiles.filter(id => id !== file.id));
                    } else {
                      setSelectedFiles([...selectedFiles, file.id]);
                    }
                  }}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedFiles.includes(file.id)}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        {file.type === 'link' ? <Link size={16} className="text-gray-400" /> : <Paperclip size={16} className="text-gray-400" />}
                        <p className="font-medium text-gray-800">{file.name}</p>
                      </div>
                      {file.description && (
                        <p className="text-sm text-gray-500">{file.description}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              No files found matching your search.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={handleSelect}
            disabled={selectedFiles.length === 0}
            className={`px-4 py-2 rounded-md ${
              selectedFiles.length === 0
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Link Selected Files
          </button>
        </div>
      </div>
    </div>
  );
};

const SpecificationSection = ({ title, content, onEdit, projectFiles }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isFileModalOpen, setIsFileModalOpen] = useState(false);
  
  const [selectedItemIndex, setSelectedItemIndex] = useState(null);

  const sectionDescriptions = {
    'Abstract': 'A brief summary of the project, its purpose, and key objectives.',
    'Problem Statement': 'A clear description of the problem or opportunity that the project aims to address.',
    'Main Objective': 'The primary goal or purpose of the project.',
    'Specific Objectives': 'Detailed, measurable objectives that support the main objective.',
    'Target Audience': 'The specific group of users or stakeholders who will benefit from the project.',
    'Expected Impact': 'The anticipated outcomes and benefits of the project.',
    'Existing Solutions': 'Current solutions or approaches to the problem in the market.',
    'Technologies & Tools': 'Technologies, frameworks, and tools that will be used in the project.',
    'Research Findings': 'Key findings from research and analysis relevant to the project.',
    'Gap Analysis': 'Analysis of gaps between current solutions and project objectives.',
    'Research Methodology': 'Approach and methods used for research and analysis.',
    'Functional Requirements': 'Specific features and functionalities required for the project.',
    'Non-Functional Requirements': 'Quality attributes, performance, and technical requirements.',
    'Business Rules': 'Rules and constraints that govern business processes and decisions.',
    'User Stories': 'User-centric descriptions of features and requirements.',
    'Technology Stack': 'List of technologies, frameworks, and tools to be used.',
    'Architecture Overview': 'High-level description of the system architecture.',
    'Integration Points': 'External systems and services that need to be integrated.',
    'Infrastructure Requirements': 'Hardware, software, and network requirements.',
    'Project Boundaries': 'Scope limits and what is not included in the project.',
    'Deliverables': 'Specific outputs and artifacts to be produced.',
    'Constraints': 'Limitations and restrictions affecting the project.',
    'Dependencies': 'External factors and resources required for the project.',
    'Acceptance Criteria': 'Conditions that must be met for project completion.',
    'Performance Metrics': 'Measurable indicators of project performance.',
    'Quality Standards': 'Standards and criteria for project quality.',
    'Compliance Requirements': 'Regulatory and compliance requirements.'
  };

  const handleEdit = () => {
    setIsEditorOpen(true);
  };

  const handleAttachFiles = (fileIds) => {
    if (selectedItemIndex !== null) {
      const currentItem = content;
      const existingFileIds = new Set(currentItem.evidence || []);
      const newFileIds = fileIds.filter(id => !existingFileIds.has(id));
      
      onEdit({
        ...currentItem,
        evidence: [
          ...(currentItem.evidence || []),
          ...newFileIds
        ]
      });
    }
  };

  
  



  
  
  

  return (
    <div className="border rounded-lg overflow-hidden h-full flex flex-col">
      <div 
        className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer group relative"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 relative">
          {isExpanded ? <ChevronDown size={20} className="flex-shrink-0" /> : <ChevronRight size={20} className="flex-shrink-0" />}
          <h3 className="font-semibold text-gray-700 truncate">{title}</h3>
          {sectionDescriptions[title] && (
            <div className="absolute left-0 top-full mt-2 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-w-xs pointer-events-none">
              {sectionDescriptions[title]}
              <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-800 transform rotate-45"></div>
            </div>
          )}
        </div>
      </div>
      
      {isExpanded && (
        <div className="p-4 flex-1 flex flex-col">
          {content ? (
            <div className="relative h-full group">
              <div 
                className="text-gray-600 prose prose-sm max-w-none [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>*]:mb-3 [&>*:last-child]:mb-0"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="absolute top-0 right-0 p-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-opacity duration-200"
              >
                <Edit2 size={16} />
              </button>
            </div>
          ) : (
            <div className="text-gray-500 text-center py-4 relative group flex-1 flex items-center justify-center">
              <span>No content available.</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit();
                }}
                className="absolute top-1/2 right-4 -translate-y-1/2 p-2 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-blue-600 transition-opacity duration-200"
              >
                <Edit2 size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      <RichTextEditorModal
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        initialValue={content || ''}
        title={title}
        onSave={async (newContent) => {
          await onEdit(newContent);
          setIsEditorOpen(false);
        }}
      />

      <FileSelectionModal
        isOpen={isFileModalOpen}
        onClose={() => {
          setIsFileModalOpen(false);
          setSelectedItemIndex(null);
        }}
        onSelect={handleAttachFiles}
        projectFiles={projectFiles}
        selectedFiles={selectedItemIndex !== null ? content.evidence || [] : []}
      />
    </div>
  );
};

const ProjectSpecifications = ({ project }) => {
  const { user } = useFirebase();
  const [searchQuery] = useState('');
  const [specifications, setSpecifications] = useState({
    problem: {
      abstract: '',
      statement: '',
      mainObjective: '',
      specificObjectives: '',
      targetAudience: '',
      impact: ''
    },
    literature: {
      existingSolutions: '',
      technologies: '',
      researchFindings: '',
      gapAnalysis: '',
      methodology: ''
    },
    requirements: {
      functional: '',
      nonFunctional: '',
      businessRules: '',
      userStories: ''
    },
    technical: {
      stack: '',
      architecture: '',
      integration: '',
      infrastructure: ''
    },
    scope: {
      boundaries: '',
      deliverables: '',
      constraints: '',
      dependencies: ''
    },
    success: {
      acceptance: '',
      performance: '',
      quality: '',
      compliance: ''
    }
  });
  const [activeTab, setActiveTab] = useState('problem');
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for forcing re-render

  // Memoize the conversion function to prevent infinite loops
  const convertProjectSpecifications = useCallback(() => {
    if (!project?.specifications) return;
    
    const convertedSpecs = {};
    Object.keys(specifications).forEach(section => {
      convertedSpecs[section] = {};
      Object.keys(specifications[section]).forEach(subsection => {
        const existingContent = project.specifications[section]?.[subsection];
        convertedSpecs[section][subsection] = Array.isArray(existingContent) 
          ? (existingContent[0]?.description || '') 
          : (existingContent || '');
      });
    });
    return convertedSpecs;
  }, [project?.specifications, specifications]);

  // Update specifications when project changes
  useEffect(() => {
    const convertedSpecs = convertProjectSpecifications();
    if (convertedSpecs) {
      setSpecifications(convertedSpecs);
    }
  }, [project, refreshKey, convertProjectSpecifications]);

  const handleEdit = async (section, subsection, content) => {
    const updatedSpecs = {
      ...specifications,
      [section]: {
        ...specifications[section],
        [subsection]: content
      }
    };

    try {
      await firebaseDb.updateProject(project.id, {
        specifications: updatedSpecs,
        lastModified: new Date(),
        lastModifiedBy: user.email
      });

      setSpecifications(updatedSpecs);
      // Increment refreshKey to force a refresh
      setRefreshKey(prev => prev + 1);
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Error updating specifications:', error);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  const filterSpecifications = (specs) => {
    if (!searchQuery) return specs;

    const searchLower = searchQuery.toLowerCase();
    const filteredSpecs = {};

    Object.entries(specs).forEach(([section, subsections]) => {
      filteredSpecs[section] = {};
      Object.entries(subsections || {}).forEach(([subsection, content]) => {
        if (content.toLowerCase().includes(searchLower)) {
          filteredSpecs[section][subsection] = content;
        }
      });
    });

    return filteredSpecs;
  };

  const tabConfig = {
    problem: {
      title: 'Problem Statement',
      icon: '❓',
      sections: {
        abstract: 'Abstract',
        statement: 'Problem Statement',
        mainObjective: 'Main Objective',
        specificObjectives: 'Specific Objectives',
        targetAudience: 'Target Audience',
        impact: 'Expected Impact'
      }
    },
    literature: {
      title: 'Literature Review',
      icon: '📚',
      sections: {
        existingSolutions: 'Existing Solutions',
        technologies: 'Technologies & Tools',
        researchFindings: 'Research Findings',
        gapAnalysis: 'Gap Analysis',
        methodology: 'Research Methodology'
      }
    },
    requirements: {
      title: 'Project Requirements',
      icon: '📋',
      sections: {
        functional: 'Functional Requirements',
        nonFunctional: 'Non-Functional Requirements',
        businessRules: 'Business Rules',
        userStories: 'User Stories'
      }
    },
    technical: {
      title: 'Technical Specifications',
      icon: '⚙️',
      sections: {
        stack: 'Technology Stack',
        architecture: 'Architecture Overview',
        integration: 'Integration Points',
        infrastructure: 'Infrastructure Requirements'
      }
    },
    scope: {
      title: 'Scope Definition',
      icon: '🎯',
      sections: {
        boundaries: 'Project Boundaries',
        deliverables: 'Deliverables',
        constraints: 'Constraints',
        dependencies: 'Dependencies'
      }
    },
    success: {
      title: 'Success Criteria',
      icon: '🎉',
      sections: {
        acceptance: 'Acceptance Criteria',
        performance: 'Performance Metrics',
        quality: 'Quality Standards',
        compliance: 'Compliance Requirements'
      }
    }
  };

  const filteredSpecs = filterSpecifications(specifications);

  return (
    <div className="space-y-4">
      <div className="flex space-x-1 border-b overflow-x-auto">
        {Object.entries(tabConfig).map(([key, { title, icon }]) => (
          <button
            key={key}
            onClick={() => {
              setActiveTab(key);
              // Refresh content when switching tabs
              setRefreshKey(prev => prev + 1);
            }}
            className={`px-4 py-2 border-b-2 font-medium text-sm transition-colors duration-200 ease-in-out flex items-center gap-2 whitespace-nowrap
              ${activeTab === key 
                ? 'border-blue-500 text-blue-600' 
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            <span>{icon}</span>
            {title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 auto-rows-fr">
        {Object.entries(tabConfig[activeTab].sections).map(([sectionKey, sectionTitle]) => {
          const sectionContent = filteredSpecs[activeTab]?.[sectionKey] || '';
          
          return (
            <div key={`${sectionKey}-${refreshKey}`} className="col-span-1 min-h-[140px] flex flex-col">
              <SpecificationSection
                title={sectionTitle}
                content={sectionContent}
                onEdit={(content) => handleEdit(activeTab, sectionKey, content)}
                projectFiles={project?.documents || []}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectSpecifications; 