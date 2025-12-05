
import React from 'react';
import { Entity } from '../types';
import { User, Trash2 } from 'lucide-react';

interface CharacterCardProps {
  character: Entity;
  onDelete: (id: string) => void;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({ character, onDelete }) => {
  const traits = character.metadata.traits || [];
  const role = character.metadata.role || 'Unknown';

  return (
    <div className="bg-lore-800 rounded-xl overflow-hidden border border-lore-700 shadow-lg hover:shadow-xl hover:border-lore-500 transition-all duration-300 flex flex-col h-full group">
      <div className="h-48 overflow-hidden relative bg-lore-900">
        {character.image_url ? (
          <img 
            src={character.image_url} 
            alt={character.name} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lore-600 bg-lore-800">
             <User size={64} opacity={0.5} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-lore-800 to-transparent opacity-80"></div>
        <div className="absolute bottom-3 left-4">
            <h3 className="text-xl font-bold text-white font-serif">{character.name}</h3>
            <p className="text-lore-accent text-sm font-medium tracking-wider uppercase">{role}</p>
        </div>
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-lore-300 text-sm line-clamp-3 mb-4 leading-relaxed italic">
          "{character.description}"
        </p>
        
        <div className="flex flex-wrap gap-2 mt-auto">
          {traits.map((trait, idx) => (
            <span key={idx} className="text-xs bg-lore-700 text-lore-200 px-2 py-1 rounded-md border border-lore-600">
              {trait}
            </span>
          ))}
        </div>
      </div>

       <div className="p-3 border-t border-lore-700 flex justify-end">
          <button 
            onClick={(e) => { e.stopPropagation(); onDelete(character.id); }}
            className="text-lore-500 hover:text-danger transition-colors p-1"
            title="Delete Character"
          >
            <Trash2 size={16} />
          </button>
       </div>
    </div>
  );
};
