import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, ThumbsUp, Edit2, Trash2, Reply, Send } from 'lucide-react';
import { format } from 'date-fns';
import { firebaseDb } from '../services/firebaseDb';
import { useFirebase } from '../contexts/FirebaseContext';
import { toast } from 'react-hot-toast';

const Comments = ({ projectId }) => {
  const { user } = useFirebase();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadComments = useCallback(async () => {
    try {
      const commentsData = await firebaseDb.getProjectComments(projectId);
      setComments(commentsData);
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const commentData = {
        content: newComment,
        createdAt: new Date(),
        authorId: user.uid,
        authorName: user.displayName || user.email,
        parentId: replyTo?.id || null,
        likes: [],
      };

      await firebaseDb.addProjectComment(projectId, commentData);
      setNewComment('');
      setReplyTo(null);
      await loadComments();
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleEditComment = async (commentId, newContent) => {
    try {
      await firebaseDb.updateProjectComment(projectId, commentId, { content: newContent }, user);
      setEditingComment(null);
      await loadComments();
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error('Failed to update comment');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await firebaseDb.deleteProjectComment(projectId, commentId, user);
      await loadComments();
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!user) return;

    try {
      await firebaseDb.toggleCommentLike(projectId, commentId, user.uid);
      await loadComments();
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Failed to update like');
    }
  };

  const renderComment = (comment, level = 0) => {
    const isCurrentUser = user && comment.authorId === user.uid;
    const isEditing = editingComment?.id === comment.id;
    const replies = comments.filter(c => c.parentId === comment.id);

    return (
      <div key={comment.id} className={`ml-${level * 4} mb-4`}>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="font-medium">{comment.authorName}</span>
              <span className="text-gray-500 text-sm ml-2">
                {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
              </span>
            </div>
            {isCurrentUser && (
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingComment(comment)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleEditComment(comment.id, editingComment.content);
            }}>
              <textarea
                value={editingComment.content}
                onChange={(e) => setEditingComment({ ...editingComment, content: e.target.value })}
                className="w-full p-2 border rounded-lg mb-2"
                rows="3"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setEditingComment(null)}
                  className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
              <div className="flex gap-4 mt-2">
                <button
                  onClick={() => handleLikeComment(comment.id)}
                  className={`flex items-center gap-1 text-sm ${
                    user && comment.likes?.includes(user.uid)
                      ? 'text-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <ThumbsUp size={14} />
                  {comment.likes?.length || 0}
                </button>
                <button
                  onClick={() => setReplyTo(comment)}
                  className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                >
                  <Reply size={14} />
                  Reply
                </button>
              </div>
            </>
          )}
        </div>

        {/* Render replies */}
        {replies.map(reply => renderComment(reply, level + 1))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-8">Loading comments...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare size={24} className="text-blue-600" />
        <h1 className="text-2xl font-semibold">Project Comments</h1>
      </div>

      {/* New comment form */}
      <form onSubmit={handleSubmitComment} className="space-y-3">
        {replyTo && (
          <div className="flex justify-between items-center bg-blue-50 p-2 rounded-lg">
            <span className="text-sm text-blue-700">
              Replying to {replyTo.authorName}'s comment
            </span>
            <button
              type="button"
              onClick={() => setReplyTo(null)}
              className="text-blue-700 hover:text-blue-900"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 p-2 border rounded-lg resize-none"
            rows="3"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || !user}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed h-fit"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      {/* Comments list */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments yet. Be the first to comment!
          </div>
        ) : (
          comments
            .filter(comment => !comment.parentId)
            .map(comment => renderComment(comment))
        )}
      </div>
    </div>
  );
};

export default Comments; 