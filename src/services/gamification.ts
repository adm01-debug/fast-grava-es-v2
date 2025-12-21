import { supabase } from '@/integrations/supabase/client';
export const gamificationService = {
  getLeaderboard: async () => supabase.from('leaderboard').select('*').order('points', { ascending: false }),
  addPoints: async (userId: string, points: number) => ({ success: true }),
};
