
import React, { useState } from 'react';
import { signIn, signUp } from '../services/supabaseService';
import { Feather, Loader2, ArrowRight } from 'lucide-react';

interface AuthProps {
  onLoginSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onLoginSuccess();
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        setMessage("Account created! Please check your email to verify (or try logging in if email confirmation is disabled).");
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lore-900 bg-[url('https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-blend-overlay bg-no-repeat">
      <div className="w-full max-w-md bg-lore-900/95 backdrop-blur-md p-8 rounded-2xl border border-lore-700 shadow-2xl animate-fade-in">
        <div className="flex flex-col items-center mb-8">
            <div className="p-3 bg-lore-accent rounded-xl text-lore-900 mb-4 shadow-lg shadow-lore-accent/20">
                <Feather size={32} />
            </div>
            <h1 className="text-3xl font-serif font-bold text-white tracking-wide">LoreBook</h1>
            <p className="text-lore-400 mt-2 text-center">Your gateway to infinite worlds.</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-lore-300 mb-1">Email Address</label>
                <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-lore-800 border border-lore-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-lore-accent focus:border-transparent outline-none transition-all"
                    placeholder="architect@world.com"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-lore-300 mb-1">Password</label>
                <input 
                    type="password" 
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full bg-lore-800 border border-lore-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-lore-accent focus:border-transparent outline-none transition-all"
                    placeholder="••••••••"
                    required
                />
            </div>

            {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm">
                    {error}
                </div>
            )}
            
            {message && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-lg text-sm">
                    {message}
                </div>
            )}

            <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-lore-accent hover:bg-yellow-400 text-lore-900 font-bold rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex justify-center items-center gap-2"
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                        {isLogin ? 'Enter the Realm' : 'Begin Your Journey'}
                        <ArrowRight size={18} />
                    </>
                )}
            </button>
        </form>

        <div className="mt-6 text-center">
            <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }}
                className="text-lore-400 hover:text-lore-accent text-sm font-medium transition-colors"
            >
                {isLogin ? "Need an account? Forge one." : "Already have a key? Enter here."}
            </button>
        </div>
      </div>
    </div>
  );
};
