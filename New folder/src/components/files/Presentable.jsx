import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  File, 
  Video, 
  Presentation, 
  
  ExternalLink,
  Plus,
  Trash2
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { firebaseDb } from '../../services/firebaseDb';

const DocumentLink = ({ title, icon: Icon, linkedFiles, onRemove, onAdd, section }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileClick = (file) => {
    if (file.url) {
      window.open(file.url, '_blank');
    } else if (file.fileUrl) {
      window.open(file.fileUrl, '_blank');
    } else {
      toast.error('File URL not found');
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-gray-500" />
        <h3 className="font-medium text-gray-900">{title}</h3>
      </div>
      
      <div className="space-y-2">
        {linkedFiles?.map((file, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <File className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700 truncate">{file.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFileClick(file)}
                className="text-blue-600 hover:text-blue-800"
                title={file.url ? "Open link" : "Open file"}
              >
                {file.url ? (
                  <ExternalLink className="w-4 h-4" />
                ) : (
                  <FileText className="w-4 h-4" />
                )}
              </button>
              <button
                onClick={() => onRemove(section, index)}
                className="text-red-600 hover:text-red-800"
                title="Remove file"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="mt-2 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <Plus className="w-4 h-4" />
        Add File
      </button>

      <FileSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={(file) => {
          onAdd(section, file);
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

const FileSelectionModal = ({ isOpen, onClose, documents, onSelect, title }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Select {title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <ExternalLink size={20} />
          </button>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {documents.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No files available</p>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => {
                    onSelect(doc);
                    onClose();
                  }}
                  className="w-full text-left p-3 hover:bg-gray-50 rounded-lg flex items-center gap-2"
                >
                  <File size={16} className="text-gray-500" />
                  <span className="text-sm">{doc.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const Presentable = ({ projectId, documents }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSection, setSelectedSection] = useState(null);
  const [linkedFiles, setLinkedFiles] = useState({
    finalReport: [],
    onePager: [],
    presentation: [],
    videoDemo: [],
    pitchDeck: [],
    shortVideoDemo: []
  });
  const [loading, setLoading] = useState(true);

  const loadPresentable = useCallback(async () => {
    try {
      const presentableData = await firebaseDb.getProjectPresentable(projectId);
      setLinkedFiles(presentableData);
    } catch (error) {
      console.error('Error loading presentable:', error);
      toast.error('Failed to load presentable files');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadPresentable();
  }, [loadPresentable]);

  const handleFileSelected = async (file) => {
    try {
      const updatedFiles = {
        ...linkedFiles,
        [selectedSection]: [...linkedFiles[selectedSection], file]
      };
      
      await firebaseDb.updateProjectPresentable(projectId, updatedFiles);
      setLinkedFiles(updatedFiles);
      toast.success('File linked successfully');
    } catch (error) {
      console.error('Error linking file:', error);
      toast.error('Failed to link file');
    }
  };

  const handleRemoveFile = async (section, index) => {
    try {
      const updatedFiles = {
        ...linkedFiles,
        [section]: linkedFiles[section].filter((_, i) => i !== index)
      };
      
      await firebaseDb.updateProjectPresentable(projectId, updatedFiles);
      setLinkedFiles(updatedFiles);
      toast.success('File removed successfully');
    } catch (error) {
      console.error('Error removing file:', error);
      toast.error('Failed to remove file');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Main Documentation</h2>
        <DocumentLink
          title="Final Project Report"
          icon={FileText}
          linkedFiles={linkedFiles.finalReport}
          onRemove={(section, index) => handleRemoveFile(section, index)}
          onAdd={(section, file) => handleFileSelected(file)}
          section="finalReport"
        />
        <DocumentLink
          title="One Pager"
          icon={File}
          linkedFiles={linkedFiles.onePager}
          onRemove={(section, index) => handleRemoveFile(section, index)}
          onAdd={(section, file) => handleFileSelected(file)}
          section="onePager"
        />
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* Left Column - Normal Presentations */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Normal Presentations</h2>
          <DocumentLink
            title="PPT Presentation"
            icon={Presentation}
            linkedFiles={linkedFiles.presentation}
            onRemove={(section, index) => handleRemoveFile(section, index)}
            onAdd={(section, file) => handleFileSelected(file)}
            section="presentation"
          />
          <DocumentLink
            title="Video Demo"
            icon={Video}
            linkedFiles={linkedFiles.videoDemo}
            onRemove={(section, index) => handleRemoveFile(section, index)}
            onAdd={(section, file) => handleFileSelected(file)}
            section="videoDemo"
          />
        </div>

        {/* Right Column - Pitch Materials */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Pitch Materials</h2>
          <DocumentLink
            title="PPT Pitch Deck"
            icon={Presentation}
            linkedFiles={linkedFiles.pitchDeck}
            onRemove={(section, index) => handleRemoveFile(section, index)}
            onAdd={(section, file) => handleFileSelected(file)}
            section="pitchDeck"
          />
          <DocumentLink
            title="Short Video Demo"
            icon={Video}
            linkedFiles={linkedFiles.shortVideoDemo}
            onRemove={(section, index) => handleRemoveFile(section, index)}
            onAdd={(section, file) => handleFileSelected(file)}
            section="shortVideoDemo"
          />
        </div>
      </div>

      <FileSelectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedSection(null);
        }}
        documents={documents}
        onSelect={handleFileSelected}
        title="File"
      />
    </div>
  );
};

export default Presentable; 