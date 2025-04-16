import React, { useState, useEffect } from 'react';
import {
  Edit2,
  Trash2,
  Plus,
  X,
  Link as LinkIcon,
  Eye,
  Heart,
  
} from 'lucide-react';

export const SOCIAL_MEDIA_PLATFORMS = {
  instagram: {
    name: 'Instagram',
    icon: 'instagram',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    metrics: {
      views: { icon: Eye, label: 'Views', isDefault: true },
      likes: { icon: Heart, label: 'Likes', isDefault: true }
    },
    contentTypes: ['Post', 'Story', 'Reel']
  },
  twitter: {
    name: 'X (Twitter)',
    icon: 'twitter',
    color: 'text-gray-800',
    bgColor: 'bg-gray-50',
    metrics: {
      views: { icon: Eye, label: 'Views', isDefault: true },
      likes: { icon: Heart, label: 'Likes', isDefault: true }
    },
    contentTypes: ['Tweet', 'Thread']
  },
  youtube: {
    name: 'YouTube',
    icon: 'youtube',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    metrics: {
      views: { icon: Eye, label: 'Views', isDefault: true },
      likes: { icon: Heart, label: 'Likes', isDefault: true }
    },
    contentTypes: ['Video', 'Short']
  },
  tiktok: {
    name: 'TikTok',
    icon: 'tiktok',
    color: 'text-gray-800',
    bgColor: 'bg-gray-50',
    metrics: {
      views: { icon: Eye, label: 'Views', isDefault: true },
      likes: { icon: Heart, label: 'Likes', isDefault: true }
    },
    contentTypes: ['Video']
  }
};

const PostModal = ({ isOpen, onClose, onSave, initialData = null }) => {
  const [formData, setFormData] = useState({
    type: '',
    link: '',
    description: '',
    metrics: {
      views: 0,
      uniqueViewers: 0,
      likes: 0,
      comments: 0,
      shares: 0,
      saves: 0,
      watchTime: 0,
      completionRate: 0,
      engagementRate: 0
    },
    date: new Date().toISOString().split('T')[0]
  });

  // Initialize form data when initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        type: initialData.type || '',
        link: initialData.link || '',
        description: initialData.description || '',
        metrics: {
          views: initialData.metrics?.views || 0,
          uniqueViewers: initialData.metrics?.uniqueViewers || 0,
          likes: initialData.metrics?.likes || 0,
          comments: initialData.metrics?.comments || 0,
          shares: initialData.metrics?.shares || 0,
          saves: initialData.metrics?.saves || 0,
          watchTime: initialData.metrics?.watchTime || 0,
          completionRate: initialData.metrics?.completionRate || 0,
          engagementRate: initialData.metrics?.engagementRate || 0
        },
        date: initialData.date || new Date().toISOString().split('T')[0]
      });
    }
  }, [initialData]);

  const platform = SOCIAL_MEDIA_PLATFORMS[initialData?.platform || 'instagram'];
  const metrics = platform.metrics;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            {initialData ? 'Edit Post' : 'Add New Post'}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={(e) => {
          e.preventDefault();
          onSave({
            ...formData,
            id: initialData?.id || Date.now().toString()
          });
          onClose();
        }} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Content Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            >
              <option value="">Select Type</option>
              {platform.contentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Link
            </label>
            <input
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              placeholder="https://"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Metrics
            </label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(metrics).map(([key, config]) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    {config.label}
                  </label>
                  <input
                    type={key.includes('Rate') ? 'number' : 'number'}
                    value={formData.metrics[key]}
                    onChange={(e) => {
                      let value = e.target.value === '' ? 0 : parseFloat(e.target.value);
                      if (key.includes('Rate')) {
                        value = Math.min(1, Math.max(0, value / 100));
                      }
                      setFormData({
                        ...formData,
                        metrics: { ...formData.metrics, [key]: value }
                      });
                    }}
                    className="w-full px-3 py-2 border rounded-md"
                    min={key.includes('Rate') ? 0 : 0}
                    max={key.includes('Rate') ? 100 : undefined}
                    step={key.includes('Rate') ? 0.1 : 1}
                    placeholder={key.includes('Rate') ? 'Enter percentage' : '0'}
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Posted
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {initialData ? 'Update' : 'Add'} Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SocialMediaTracker = ({ platform, data = { posts: [] }, onUpdate, onRemove, canRemove }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const platformConfig = SOCIAL_MEDIA_PLATFORMS[platform];

  const handleSavePost = (postData) => {
    const updatedPosts = editingPost
      ? data.posts.map(post => post.id === postData.id ? { ...postData, platform } : post)
      : [...data.posts, { ...postData, platform }];
    
    onUpdate({ ...data, posts: updatedPosts });
    setEditingPost(null);
  };

  const handleDeletePost = (postId) => {
    const updatedPosts = data.posts.filter(post => post.id !== postId);
    onUpdate({ ...data, posts: updatedPosts });
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      <div className={`p-3 ${platformConfig.bgColor} border-b flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <i className={`fab fa-${platformConfig.icon} ${platformConfig.color} text-xl`} />
          <h3 className="font-semibold text-gray-800">{platformConfig.name}</h3>
        </div>
        <div className="flex items-center gap-2">
          {canRemove && (
            <button
              onClick={onRemove}
              className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
              title="Remove platform"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            onClick={() => {
              setEditingPost(null);
              setIsModalOpen(true);
            }}
            className="p-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded"
            title="Add post"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div className="divide-y">
        {data.posts.map((post) => (
          <div key={post.id} className="flex items-center justify-between p-2 hover:bg-gray-50">
            <div className="flex items-center gap-4 min-w-0 flex-1">
              <div className="flex items-center gap-2 min-w-[120px]">
                <span className="font-medium text-sm text-gray-900">
                  {post.type}
                </span>
                <span className="text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex-1 text-sm text-gray-600 truncate">
                {post.description}
              </div>

              <div className="flex items-center gap-4 min-w-[140px]">
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Eye size={14} />
                  {post.metrics.views?.toLocaleString() || 0}
                </span>
                <span className="flex items-center gap-1 text-sm text-gray-600">
                  <Heart size={14} />
                  {post.metrics.likes?.toLocaleString() || 0}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700"
              >
                <LinkIcon size={14} />
              </a>
              <button
                onClick={() => {
                  setEditingPost(post);
                  setIsModalOpen(true);
                }}
                className="text-gray-600 hover:text-blue-600"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to delete this post?')) {
                    handleDeletePost(post.id);
                  }
                }}
                className="text-gray-600 hover:text-red-600"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {data.posts.length === 0 && (
          <div className="text-center py-3 text-sm text-gray-500">
            No posts added yet
          </div>
        )}
      </div>

      <PostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        initialData={editingPost ? { ...editingPost, platform } : { platform }}
      />
    </div>
  );
};

export default SocialMediaTracker; 