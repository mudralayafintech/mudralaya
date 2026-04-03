'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function OnboardingClient({ userId }: { userId: string }) {
  const [city, setCity] = useState('');
  const [skills, setSkills] = useState('');
  const [interests, setInterests] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const interestsArray = interests.split(',').map(s => s.trim()).filter(Boolean);

      const { error } = await supabase
        .from('users')
        .update({
          city,
          skills: skillsArray,
          interests: interestsArray
        })
        .eq('id', userId);

      if (error) throw error;

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error(error);
      alert('Failed to save profile details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-semibold">City</label>
        <input 
          type="text" 
          value={city}
          onChange={e => setCity(e.target.value)}
          placeholder="E.g., Mumbai, New Delhi"
          className="w-full p-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Skills (Comma separated)</label>
        <input 
          type="text" 
          value={skills}
          onChange={e => setSkills(e.target.value)}
          placeholder="E.g., Data Entry, Design, Writing"
          className="w-full p-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Interests (Comma separated)</label>
        <input 
          type="text" 
          value={interests}
          onChange={e => setInterests(e.target.value)}
          placeholder="E.g., Technology, Finance, Marketing"
          className="w-full p-3 bg-background border rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-primary text-primary-foreground font-semibold py-3 px-4 rounded-xl shadow hover:bg-primary/90 transition-colors disabled:opacity-50 mt-4"
      >
        {loading ? 'Saving...' : 'Continue to Dashboard'}
      </button>
    </form>
  );
}
