
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Photo, ViewMode } from './types';
import { analyzeImage } from './services/geminiService';
import { fileToBase64, generateId } from './utils/helpers';
import PhotoGrid from './components/PhotoGrid';
import PhotoDetail from './components/PhotoDetail';

const INITIAL_PHOTOS: Photo[] = [
  {
    id: '1',
    url: 'https://picsum.photos/seed/nature1/800/800',
    title: 'Morning Mist',
    description: 'A serene mountain landscape covered in morning fog.',
    tags: ['nature', 'mountains', 'fog'],
    category: 'Nature',
    date: new Date().toISOString()
  },
  {
    id: '2',
    url: 'https://picsum.photos/seed/city1/800/800',
    title: 'Neon Nights',
    description: 'The vibrant streets of a futuristic city at night.',
    tags: ['city', 'neon', 'lights'],
    category: 'Architecture',
    date: new Date().toISOString()
  }
];

const App: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>(INITIAL_PHOTOS);
  const [activeTab, setActiveTab] = useState(ViewMode.GRID);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return photos;
    const query = searchQuery.toLowerCase();
    return photos.filter(p => 
      p.title.toLowerCase().includes(query) || 
      p.description.toLowerCase().includes(query) || 
      p.tags.some(t => t.toLowerCase().includes(query)) ||
      p.category.toLowerCase().includes(query)
    );
  }, [photos, searchQuery]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const base64 = await fileToBase64(file);
      const analysis = await analyzeImage(base64);
      
      const newPhoto: Photo = {
        id: generateId(),
        url: base64,
        title: analysis.title,
        description: analysis.description,
        tags: analysis.tags,
        category: analysis.category,
        date: new Date().toISOString()
      };

      setPhotos(prev => [newPhoto, ...prev]);
    } catch (error) {
      console.error("Upload/Analysis failed:", error);
      alert("Failed to analyze image. It has been added with default info.");
      
      const fallbackPhoto: Photo = {
        id: generateId(),
        url: await fileToBase64(file),
        title: 'New Photo',
        description: 'Uploaded from device',
        tags: ['uploaded'],
        category: 'Other',
        date: new Date().toISOString()
      };
      setPhotos(prev => [fallbackPhoto, ...prev]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const updatePhoto = (updatedPhoto: Photo) => {
    setPhotos(prev => prev.map(p => p.id === updatedPhoto.id ? updatedPhoto : p));
    setSelectedPhoto(updatedPhoto);
  };

  const deletePhoto = (id: string) => {
    if (confirm("Are you sure you want to delete this photo?")) {
      setPhotos(prev => prev.filter(p => p.id !== id));
      setSelectedPhoto(null);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-white shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-10 pb-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Photos</h1>
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-3 bg-indigo-600 text-white rounded-full shadow-lg active:scale-95 transition-transform"
          >
            {isUploading ? (
              <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search people, places, things..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-100 border-none rounded-2xl py-3 pl-12 pr-4 text-gray-700 focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          className="hidden" 
          accept="image/*" 
        />
      </header>

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === ViewMode.GRID && (
          <PhotoGrid 
            photos={filteredPhotos} 
            onPhotoClick={setSelectedPhoto} 
          />
        )}
        
        {activeTab === ViewMode.ALBUMS && (
          <div className="p-6">
            <h2 className="text-xl font-bold mb-4">Smart Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              {['Nature', 'Architecture', 'People', 'Other'].map(cat => (
                <div 
                  key={cat} 
                  onClick={() => setSearchQuery(cat)}
                  className="bg-gray-100 h-32 rounded-2xl p-4 flex flex-col justify-end cursor-pointer hover:bg-gray-200 transition-colors"
                >
                  <p className="font-bold text-gray-800">{cat}</p>
                  <p className="text-xs text-gray-500">{photos.filter(p => p.category === cat).length} photos</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Navigation Bar */}
      <nav className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t flex justify-around items-center py-4 safe-area-bottom">
        <button 
          onClick={() => setActiveTab(ViewMode.GRID)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === ViewMode.GRID ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Gallery</span>
        </button>
        <button 
          onClick={() => setActiveTab(ViewMode.ALBUMS)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeTab === ViewMode.ALBUMS ? 'text-indigo-600' : 'text-gray-400'}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-wider">Albums</span>
        </button>
      </nav>

      {/* Detail Overlay */}
      {selectedPhoto && (
        <PhotoDetail 
          photo={selectedPhoto} 
          onClose={() => setSelectedPhoto(null)} 
          onUpdate={updatePhoto}
          onDelete={deletePhoto}
        />
      )}
    </div>
  );
};

export default App;
