import { useState, useEffect } from 'react';
import { fetchAllStats, Stats } from '@/services/statsService';

export default function useStats() {
  const [stats, setStats] = useState<Stats>({
    dreamCount: 0,
    lucidDreamCount: 0,
    avgSleep: '0h',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedStats = await fetchAllStats();
      setStats(fetchedStats);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return { stats, loading, error, refresh: loadStats };
}
