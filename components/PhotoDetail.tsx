
import React, { useState } from 'react';
import { Photo } from '../types';
import { editImageWithAi } from '../services/geminiService';

interface PhotoDetailProps {
  photo: Photo;
  onClose: () => void;
  onUpdate: (photo: Photo) => void;
  onDelete: (id: string) => void;
}

const PhotoDetail: React.FC<PhotoDetailProps> = ({ photo, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAiEdit = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    try {
      const editedUrl = await editImageWithAi(photo.url, prompt);
      if (editedUrl) {
        onUpdate({
          ...photo,
          url: editedUrl,
          isAiGenerated: true,
          description: `${photo.description} (AI Edited: ${prompt})`
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Edit failed:", error);
      alert("AI editing failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col md:flex-row h-screen">
      {/* Photo Area */}
      <div className="relative flex-1 flex items-center justify-center bg-black/90 p-4">
        <button 
          onClick={onClose}
          className="absolute top-4 left-4 z-50 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <img 
          src={photo.url} 
          alt={photo.title} 
          className="max-h-full max-w-full object-contain shadow-2xl rounded-lg"
        />
      </div>

      {/* Info Panel */}
      <div className="w-full md:w-96 bg-white overflow-y-auto p-6 flex flex-col shadow-xl">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{photo.title}</h2>
          <p className="text-sm text-gray-500 mb-4">{new Date(photo.date).toLocaleDateString()}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
              {photo.category}
            </span>
            {photo.tags.map(tag => (
              <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                #{tag}
              </span>
            ))}
          </div>
          <p className="text-gray-700 italic leading-relaxed">"{photo.description}"</p>
        </div>

        <div className="border-t pt-6 mt-auto">
          {!isEditing ? (
            <div className="space-y-3">
              <button 
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                AI Magic Edit
              </button>
              <button 
                onClick={() => onDelete(photo.id)}
                className="w-full px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
              >
                Delete Photo
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 rounded-lg">
                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-2">AI Prompt</p>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Add a dramatic sunset background' or 'Change the car to red'"
                  className="w-full bg-white border border-indigo-200 rounded-md p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  rows={3}
                />
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleAiEdit}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
                >
                  {loading ? 'Processing...' : 'Apply AI'}
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-bold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PhotoDetail;
