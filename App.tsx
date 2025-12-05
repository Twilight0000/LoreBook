
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { CharacterCard } from './components/CharacterCard';
import { Auth } from './components/Auth';
import { generateCharacter, generatePlace } from './services/geminiService';
import { AppView, Entity, EntityType } from './types';
import { Plus, Wand2, Calendar, Save, AlertCircle, Loader2, Database, Trash2, Users, Map as MapIconLucide, Ghost } from 'lucide-react';
import { getSession, signOut, fetchEntities, createEntity, deleteEntity, getSupabase } from './services/supabaseService';

function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  
  // Data State
  const [entities, setEntities] = useState<Entity[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  
  // UI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create_char' | 'create_place' | 'create_event' | null>(null);
  
  // Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemRole, setNewItemRole] = useState(''); // for char
  const [newItemType, setNewItemType] = useState(''); // for place
  const [newItemDate, setNewItemDate] = useState(''); // for timeline

  // Initial Auth Check
  useEffect(() => {
    getSession().then(s => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  // Fetch Data when Session is Active
  useEffect(() => {
    if (session?.user) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    if (!session?.user) return;
    setDataLoading(true);
    try {
      const data = await fetchEntities(session.user.id);
      setEntities(data);
    } catch (e) {
      console.error("Error loading entities", e);
    } finally {
      setDataLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    setSession(null);
    setEntities([]);
  };

  // Helper to filter entities
  const characters = entities.filter(e => e.type === 'CHARACTER');
  const places = entities.filter(e => e.type === 'PLACE');
  const timeline = entities.filter(e => e.type === 'EVENT');

  const handleGenerateCharacter = async () => {
    if (!newItemName) return;
    setIsGenerating(true);
    try {
      const data = await generateCharacter(`Create a fantasy character named ${newItemName}. ${newItemDesc ? `Description hint: ${newItemDesc}` : ''}`);
      
      const newEntity: Omit<Entity, 'id' | 'created_at'> = {
        user_id: session.user.id,
        type: 'CHARACTER',
        name: data.name,
        description: data.description,
        image_url: `https://picsum.photos/400/300?random=${Date.now()}`,
        metadata: {
          role: data.role,
          traits: data.traits || []
        }
      };
      
      const saved = await createEntity(newEntity);
      setEntities([saved, ...entities]);
      setModalOpen(false);
      resetForm();
    } catch (e) {
      alert("Failed to generate character. Check API Key.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePlace = async () => {
      if (!newItemName) return;
      setIsGenerating(true);
      try {
        const data = await generatePlace(`Create a place named ${newItemName}. ${newItemDesc ? `Context: ${newItemDesc}` : ''}`);
        
        const newEntity: Omit<Entity, 'id' | 'created_at'> = {
            user_id: session.user.id,
            type: 'PLACE',
            name: data.name,
            description: data.description,
            image_url: `https://picsum.photos/400/300?random=${Date.now()}`,
            metadata: {
                placeType: data.type
            }
        };

        const saved = await createEntity(newEntity);
        setEntities([saved, ...entities]);
        setModalOpen(false);
        resetForm();
      } catch (e) {
          alert("Failed to generate place.");
      } finally {
          setIsGenerating(false);
      }
  };

  const handleManualCreate = async (type: EntityType) => {
      const newEntity: Omit<Entity, 'id' | 'created_at'> = {
        user_id: session.user.id,
        type,
        name: newItemName,
        description: newItemDesc,
        image_url: type !== 'EVENT' ? `https://picsum.photos/400/300?random=${Date.now()}` : undefined,
        metadata: {
            role: newItemRole,
            placeType: newItemType,
            dateStr: newItemDate,
            order: type === 'EVENT' ? timeline.length + 1 : 0
        }
      };

      try {
        const saved = await createEntity(newEntity);
        setEntities([saved, ...entities]);
        setModalOpen(false);
        resetForm();
      } catch (e) {
        console.error("Failed to create entity", e);
        alert("Could not save entity. Is Supabase connected?");
      }
  };

  const handleDelete = async (id: string) => {
      try {
          await deleteEntity(id);
          setEntities(entities.filter(e => e.id !== id));
      } catch (e) {
          alert("Failed to delete.");
      }
  };

  const resetForm = () => {
    setNewItemName('');
    setNewItemDesc('');
    setNewItemRole('');
    setNewItemType('');
    setNewItemDate('');
  };

  const openModal = (mode: 'create_char' | 'create_place' | 'create_event') => {
    setModalMode(mode);
    setModalOpen(true);
    resetForm();
  };

  // --- Render Views ---

  if (loading) {
      return (
          <div className="h-screen w-screen bg-lore-900 flex items-center justify-center text-lore-accent">
              <Loader2 className="animate-spin" size={48} />
          </div>
      )
  }

  if (!session) {
      return <Auth onLoginSuccess={() => getSession().then(setSession)} />;
  }

  const renderDashboard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
      <div className="bg-lore-800 p-6 rounded-xl border border-lore-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif text-white">Characters</h3>
            <UsersIcon className="text-lore-accent" />
        </div>
        <p className="text-4xl font-bold text-lore-100 mb-2">{characters.length}</p>
        <p className="text-lore-400 text-sm">Heroes and Villains.</p>
      </div>
      
      <div className="bg-lore-800 p-6 rounded-xl border border-lore-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif text-white">Places</h3>
            <MapIcon className="text-lore-accent" />
        </div>
        <p className="text-4xl font-bold text-lore-100 mb-2">{places.length}</p>
        <p className="text-lore-400 text-sm">Locations discovered.</p>
      </div>

      <div className="bg-lore-800 p-6 rounded-xl border border-lore-700 shadow-lg">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-serif text-white">Timeline</h3>
            <CalendarIcon className="text-lore-accent" />
        </div>
        <p className="text-4xl font-bold text-lore-100 mb-2">{timeline.length}</p>
        <p className="text-lore-400 text-sm">Events logged.</p>
      </div>

       <div className="col-span-1 md:col-span-3 mt-8 bg-lore-800/50 p-6 rounded-xl border border-lore-700 border-dashed flex flex-col items-center justify-center text-center">
            <Wand2 className="text-lore-500 mb-4" size={48} />
            <h3 className="text-xl font-bold text-lore-200 mb-2">Build Your World with AI</h3>
            <p className="text-lore-400 max-w-lg mx-auto mb-6">
                Use the "Generate" features in the Characters and Places tabs to let Gemini forge new lore for you instantly.
            </p>
            <div className="flex gap-4">
                <button onClick={() => { setCurrentView(AppView.CHARACTERS); setTimeout(() => openModal('create_char'), 100); }} className="px-6 py-2 bg-lore-accent text-lore-900 font-bold rounded-full hover:bg-yellow-400 transition-colors">
                    Create Character
                </button>
            </div>
       </div>
    </div>
  );

  const renderCharacters = () => (
    <div className="h-full flex flex-col animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-serif font-bold text-white">Characters</h2>
          <p className="text-lore-400">Manage the souls of your world.</p>
        </div>
        <button 
            onClick={() => openModal('create_char')}
            className="flex items-center gap-2 bg-lore-accent hover:bg-yellow-400 text-lore-900 px-4 py-2 rounded-lg font-semibold transition-colors shadow-lg shadow-lore-900/50"
        >
            <Plus size={18} /> Add Character
        </button>
      </div>

      {dataLoading ? <div className="text-lore-400 flex justify-center mt-10"><Loader2 className="animate-spin" /></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-10">
            {characters.length === 0 && (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-lore-600">
                    <Ghost size={48} className="mb-4" />
                    <p>No characters yet. Summon one!</p>
                </div>
            )}
            {characters.map(char => (
                <CharacterCard key={char.id} character={char} onDelete={handleDelete} />
            ))}
        </div>
      )}
    </div>
  );

  const renderPlaces = () => (
    <div className="h-full flex flex-col animate-fade-in">
        <div className="flex justify-between items-center mb-6">
            <div>
            <h2 className="text-3xl font-serif font-bold text-white">Places</h2>
            <p className="text-lore-400">The geography of your imagination.</p>
            </div>
            <button 
                onClick={() => openModal('create_place')}
                className="flex items-center gap-2 bg-lore-600 hover:bg-lore-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
                <Plus size={18} /> Add Place
            </button>
        </div>
        
        {dataLoading ? <div className="text-lore-400 flex justify-center mt-10"><Loader2 className="animate-spin" /></div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pb-10">
                {places.map(place => (
                    <div key={place.id} className="bg-lore-800 rounded-xl overflow-hidden border border-lore-700 flex flex-col md:flex-row shadow-lg">
                        <div className="md:w-1/3 h-48 md:h-auto bg-lore-900 relative">
                            {place.image_url ? (
                                <img src={place.image_url} className="w-full h-full object-cover" alt={place.name} />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-lore-900 text-lore-700"><MapIconLucide size={48} /></div>
                            )}
                            <div className="absolute inset-0 bg-black/20"></div>
                        </div>
                        <div className="p-6 md:w-2/3 flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start">
                                    <h3 className="text-2xl font-serif font-bold text-white mb-1">{place.name}</h3>
                                    <button onClick={() => handleDelete(place.id)} className="text-lore-600 hover:text-danger"><Trash2 size={16} /></button>
                                </div>
                                <span className="text-xs font-bold uppercase tracking-widest text-lore-accent mb-4 block">{place.metadata.placeType || 'Unknown Region'}</span>
                                <p className="text-lore-300 italic">"{place.description}"</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )}
    </div>
  );

  const renderTimeline = () => (
      <div className="h-full flex flex-col relative animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <div>
            <h2 className="text-3xl font-serif font-bold text-white">Timeline</h2>
            <p className="text-lore-400">The chronology of existence.</p>
            </div>
            <button 
                onClick={() => openModal('create_event')}
                className="flex items-center gap-2 bg-lore-600 hover:bg-lore-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
                <Plus size={18} /> Add Event
            </button>
        </div>

        <div className="relative border-l-2 border-lore-700 ml-4 space-y-8 pb-10">
            {timeline.sort((a,b) => (a.metadata.order || 0) - (b.metadata.order || 0)).map((event) => (
                <div key={event.id} className="relative pl-8 group">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-lore-accent border-4 border-lore-900 shadow-sm shadow-lore-accent/50 group-hover:scale-125 transition-transform"></div>
                    <div className="bg-lore-800 p-5 rounded-lg border border-lore-700 shadow-md">
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-lore-accent font-mono text-sm font-bold">{event.metadata.dateStr}</span>
                            <button onClick={() => handleDelete(event.id)} className="text-lore-600 hover:text-danger"><Trash2 size={14} /></button>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{event.name}</h3>
                        <p className="text-lore-300 text-sm">{event.description}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
  );

  const renderSettings = () => (
      <div className="max-w-2xl mx-auto mt-10 animate-fade-in">
          <div className="bg-lore-800 p-8 rounded-xl border border-lore-700 shadow-2xl">
              <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-lore-700 rounded-full text-lore-accent">
                    <Database size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Connection Status</h2>
                    <p className="text-lore-400">You are connected to the Supabase Realm.</p>
                  </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-lore-900/50 rounded-lg border border-lore-700 mb-6">
                  <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-lore-200 font-medium">Database Active</span>
                  </div>
                  <div className="text-sm text-lore-500">
                      User ID: {session.user.id.slice(0, 8)}...
                  </div>
              </div>

              <div className="p-4 bg-lore-700/20 rounded-lg border border-lore-700/50 mb-6 text-sm text-lore-400">
                  <p className="mb-2"><strong className="text-lore-300">Note:</strong> Your data is securely stored in the Supabase cloud. You can access this world from any device by logging in.</p>
              </div>
          </div>
      </div>
  );

  return (
    <div className="flex h-screen bg-lore-900 text-lore-100 font-sans selection:bg-lore-accent selection:text-lore-900">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} onLogout={handleLogout} />
      
      <main className="flex-1 overflow-hidden relative">
          <div className="h-full p-8 overflow-y-auto scrollbar-thin scrollbar-thumb-lore-600 scrollbar-track-lore-900">
            {currentView === AppView.DASHBOARD && renderDashboard()}
            {currentView === AppView.CHARACTERS && renderCharacters()}
            {currentView === AppView.PLACES && renderPlaces()}
            {currentView === AppView.TIMELINE && renderTimeline()}
            {currentView === AppView.SETTINGS && renderSettings()}
          </div>
      </main>

      {/* MODAL */}
      {modalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-lore-800 border border-lore-600 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-fade-in">
                  <div className="p-6 border-b border-lore-700 flex justify-between items-center bg-lore-800">
                      <h3 className="text-xl font-serif font-bold text-white">
                          {modalMode === 'create_char' && 'New Character'}
                          {modalMode === 'create_place' && 'New Location'}
                          {modalMode === 'create_event' && 'New Event'}
                      </h3>
                      <button onClick={() => setModalOpen(false)} className="text-lore-500 hover:text-white">&times;</button>
                  </div>
                  
                  <div className="p-6 space-y-4">
                      {/* Name Input */}
                      <div>
                          <label className="block text-sm text-lore-400 mb-1">Name / Title</label>
                          <input 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                            className="w-full bg-lore-900 border border-lore-600 rounded-lg p-3 focus:border-lore-accent outline-none text-white"
                            placeholder="e.g. Eldric Shadowbane"
                          />
                      </div>

                      {/* Specific Inputs based on Mode */}
                      {modalMode === 'create_char' && (
                          <div>
                            <label className="block text-sm text-lore-400 mb-1">Role / Class</label>
                            <input 
                                value={newItemRole}
                                onChange={(e) => setNewItemRole(e.target.value)}
                                className="w-full bg-lore-900 border border-lore-600 rounded-lg p-3 focus:border-lore-accent outline-none text-white"
                                placeholder="e.g. Paladin"
                            />
                          </div>
                      )}
                       {modalMode === 'create_place' && (
                          <div>
                            <label className="block text-sm text-lore-400 mb-1">Type</label>
                            <input 
                                value={newItemType}
                                onChange={(e) => setNewItemType(e.target.value)}
                                className="w-full bg-lore-900 border border-lore-600 rounded-lg p-3 focus:border-lore-accent outline-none text-white"
                                placeholder="e.g. Castle, Swamp, City"
                            />
                          </div>
                      )}
                      {modalMode === 'create_event' && (
                          <div>
                            <label className="block text-sm text-lore-400 mb-1">Date String</label>
                            <input 
                                value={newItemDate}
                                onChange={(e) => setNewItemDate(e.target.value)}
                                className="w-full bg-lore-900 border border-lore-600 rounded-lg p-3 focus:border-lore-accent outline-none text-white"
                                placeholder="e.g. Year 405, Winter"
                            />
                          </div>
                      )}


                      {/* Description */}
                      <div>
                          <label className="block text-sm text-lore-400 mb-1">
                              Description 
                              {modalMode !== 'create_event' && <span className="text-xs text-lore-500 ml-2">(Used for AI Generation)</span>}
                          </label>
                          <textarea 
                            value={newItemDesc}
                            onChange={(e) => setNewItemDesc(e.target.value)}
                            className="w-full bg-lore-900 border border-lore-600 rounded-lg p-3 focus:border-lore-accent outline-none text-white h-24 resize-none"
                            placeholder="A brief description..."
                          ></textarea>
                      </div>

                      {/* AI Button Warning */}
                      {modalMode !== 'create_event' && (
                          <div className="bg-lore-700/30 p-3 rounded-lg border border-lore-700/50 flex gap-2 items-start">
                              <AlertCircle size={16} className="text-lore-accent mt-1 flex-shrink-0" />
                              <p className="text-xs text-lore-300">
                                  Using "Magic Generate" will use Gemini AI to invent details based on your name and description.
                              </p>
                          </div>
                      )}
                  </div>

                  <div className="p-6 pt-0 flex gap-3">
                      {modalMode !== 'create_event' && (
                        <button 
                            onClick={modalMode === 'create_char' ? handleGenerateCharacter : handleGeneratePlace}
                            disabled={isGenerating || !newItemName}
                            className={`flex-1 py-3 rounded-lg font-bold flex justify-center items-center gap-2 transition-all ${
                                isGenerating || !newItemName 
                                ? 'bg-lore-700 text-lore-500 cursor-not-allowed'
                                : 'bg-lore-accent text-lore-900 hover:bg-yellow-400 shadow-lg shadow-lore-accent/20'
                            }`}
                        >
                            {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
                            Magic Generate
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleManualCreate(
                            modalMode === 'create_char' ? 'CHARACTER' : 
                            modalMode === 'create_place' ? 'PLACE' : 'EVENT'
                        )}
                        className="flex-1 bg-lore-700 hover:bg-lore-600 text-white py-3 rounded-lg font-semibold transition-colors border border-lore-600"
                      >
                         {modalMode === 'create_event' ? 'Create Event' : 'Manual Save'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}

// Icons helper components for clean render
function UsersIcon({ className }: { className?: string }) { return <Users className={className} /> }
function MapIcon({ className }: { className?: string }) { return <MapIconLucide className={className} /> }
function CalendarIcon({ className }: { className?: string }) { return <Calendar className={className} /> }
function Trash2Icon({ className }: { className?: string }) { return <Trash2 className={className} /> }

export default App;
