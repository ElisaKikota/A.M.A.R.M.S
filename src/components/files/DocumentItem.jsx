import React from 'react';
import { FileText, Link2, Download, ExternalLink, Trash2, Image, FileArchive, Film, Music, Code } from 'lucide-react';
import { format } from 'date-fns';
import { storageService } from '../../firebase/storageConfig';

const getFileIcon = (fileName) => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  // Image files
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
    return <Image className="text-purple-500 flex-shrink-0" size={16} />;
  }
  
  // Archive files
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension)) {
    return <FileArchive className="text-orange-500 flex-shrink-0" size={16} />;
  }
  
  // Video files
  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension)) {
    return <Film className="text-pink-500 flex-shrink-0" size={16} />;
  }
  
  // Audio files
  if (['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
    return <Music className="text-green-500 flex-shrink-0" size={16} />;
  }
  
  // Code files
  if (['js', 'jsx', 'ts', 'tsx', 'py', 'java', 'cpp', 'html', 'css'].includes(extension)) {
    return <Code className="text-blue-500 flex-shrink-0" size={16} />;
  }
  
  // Default file icon
  return <FileText className="text-blue-500 flex-shrink-0" size={16} />;
};

const formatFileSize = (bytes) => {
  if (!bytes) return '';
  const kb = bytes / 1024;
  if (kb < 1024) {
    return `${Math.round(kb)} KB`;
  }
  const mb = kb / 1024;
  return `${mb.toFixed(1)} MB`;
};

const DocumentItem = ({ document, onDelete }) => {
  const handleDocumentClick = async () => {
    try {
      if (document.type === 'link' && document.url) {
        window.open(document.url, '_blank');
      } else if (document.type === 'file') {
        if (document.fileUrl) {
          window.open(document.fileUrl, '_blank');
        } else if (document.filePath) {
          const downloadUrl = await storageService.getDownloadUrl(document.filePath);
          if (downloadUrl) {
            window.open(downloadUrl, '_blank');
          }
        }
      }
    } catch (error) {
      console.error('Error opening document:', error);
      alert('Error opening document. Please try again.');
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    const confirmDelete = window.confirm(`Are you sure you want to delete "${document.name}"?`);
    if (confirmDelete) {
      onDelete(document.id);
    }
  };

  return (
    <div className="group bg-white border rounded-lg hover:shadow-sm transition-shadow cursor-pointer relative" onClick={handleDocumentClick}>
      {/* Delete button overlay */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleDelete}
          className="p-1 text-red-600 hover:bg-red-50 rounded-full hover:shadow-sm bg-white"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
      
      <div className="p-2.5">
        <div className="flex items-start gap-2">
          {document.type === 'file' ? (
            getFileIcon(document.name)
          ) : (
            <Link2 className="text-green-500 flex-shrink-0" size={16} />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-gray-900 truncate text-sm">
                {document.name}
              </h4>
              <div className="flex items-center gap-1">
                {document.type === 'file' && document.fileUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(document.fileUrl, '_blank');
                    }}
                    className="p-0.5 text-blue-600 hover:bg-blue-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Download"
                  >
                    <Download size={14} />
                  </button>
                )}
                {document.type === 'link' && document.url && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(document.url, '_blank');
                    }}
                    className="p-0.5 text-green-600 hover:bg-green-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Open link"
                  >
                    <ExternalLink size={14} />
                  </button>
                )}
              </div>
            </div>
            {document.description && (
              <p className="text-xs text-gray-600 mt-0.5 line-clamp-1">
                {document.description}
              </p>
            )}
          </div>
        </div>
      </div>
      <div className="px-2.5 py-1.5 bg-gray-50 border-t rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span>{format(new Date(document.createdAt), 'MMM d, yyyy')}</span>
            {document.type === 'file' && document.fileSize && (
              <>
                <span>·</span>
                <span>{formatFileSize(document.fileSize)}</span>
              </>
            )}
          </div>
          {document.uploadedBy && (
            <span className="truncate" title={document.uploadedBy}>
              {document.uploadedBy}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentItem; 