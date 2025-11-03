import { useState, useEffect } from 'react';
import { SleepService } from '@/services/sleep.service';

export interface SleepStats {
  avgDuration7Days: number | null;
  avgDuration30Days: number | null;
  consistencyScore: number;
  avgQuality: string;
  wakeUpConsistency: string;
  insights: string[];
}

interface SleepLog {
  date: string;
  hours: number;
  quality?: number;
  bedtime?: string;
  wake_time?: string;
}

export const useSleepData = (userId: string = '') => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sleepStats, setSleepStats] = useState<SleepStats | null>(null);
  const [sleepLogs, setSleepLogs] = useState<SleepLog[]>([]);
  const [sleepTrends, setSleepTrends] = useState<any>(null);

  const fetchSleepData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const date = new Date();
      const endDate = date.toISOString().split('T')[0];
      date.setDate(date.getDate() - 30);
      const startDate = date.toISOString().split('T')[0];

      const [logsResult, avgHoursResult, qualityTrendResult] = await Promise.all([
        SleepService.getByDateRange(userId, startDate, endDate),
        SleepService.getAverageHours(userId, 30),
        SleepService.getQualityTrend(userId, 30)
      ]);

      // Validate and process logs
      const logs = Array.isArray(logsResult?.data) 
        ? logsResult.data.filter((log): log is SleepLog => 
            log !== null && 
            typeof log === 'object' && 
            typeof log.hours === 'number' &&
            typeof log.date === 'string'
          )
        : [];

      setSleepLogs(logs);

      if (logs.length > 0) {
        // Calculate sleep stats
        const last7Days = logs.slice(0, 7);
        const avg7Days = last7Days.length > 0
          ? last7Days.reduce((sum, log) => sum + log.hours, 0) / last7Days.length
          : null;

        const avg30Days = typeof avgHoursResult?.data === 'number' 
          ? avgHoursResult.data 
          : null;

        // Calculate consistency score
        const bedtimes = logs
          .filter(log => log.bedtime)
          .map(log => new Date(\`2000-01-01T\${log.bedtime}\`).getTime());
        
        const consistencyScore = bedtimes.length > 0
          ? calculateConsistencyScore(bedtimes)
          : 0;

        // Calculate quality stats
        const qualityScores = Array.isArray(qualityTrendResult?.data)
          ? qualityTrendResult.data.filter(score => typeof score === 'number')
          : [];

        const avgQualityScore = qualityScores.length > 0
          ? qualityScores.reduce((sum, score) => sum + score, 0) / qualityScores.length
          : 0;

        setSleepStats({
          avgDuration7Days: avg7Days,
          avgDuration30Days: avg30Days,
          consistencyScore: Math.round(consistencyScore),
          avgQuality: getQualityLabel(avgQualityScore),
          wakeUpConsistency: calculateWakeConsistency(logs),
          insights: generateInsights(logs)
        });

        setSleepTrends({
          qualityTrend: qualityScores,
          hoursTrend: logs.map(log => log.hours)
        });
      } else {
        setSleepStats(null);
        setSleepTrends(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sleep data');
      setSleepStats(null);
      setSleepTrends(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSleepData();
  }, [userId]);

  return {
    loading,
    error,
    sleepStats,
    sleepLogs,
    sleepTrends,
    refreshData: fetchSleepData
  };
};

// Helper functions
const calculateConsistencyScore = (timestamps: number[]): number => {
  if (timestamps.length === 0) return 0;
  const avgTime = timestamps.reduce((sum, time) => sum + time, 0) / timestamps.length;
  const variance = timestamps.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / timestamps.length;
  return Math.min(100, Math.max(0, 100 - Math.sqrt(variance) / (30 * 60 * 1000) * 100));
};

const getQualityLabel = (score: number): string => {
  if (score >= 4.5) return 'Excellent';
  if (score >= 3.5) return 'Very Good';
  if (score >= 2.5) return 'Good';
  if (score >= 1.5) return 'Fair';
  return 'Poor';
};

const calculateWakeConsistency = (logs: SleepLog[]): string => {
  const wakeTimes = logs
    .filter(log => log.wake_time)
    .map(log => new Date(\`2000-01-01T\${log.wake_time}\`).getTime());

  if (wakeTimes.length === 0) return 'Low';

  const avgTime = wakeTimes.reduce((sum, time) => sum + time, 0) / wakeTimes.length;
  const variance = wakeTimes.reduce((sum, time) => sum + Math.pow(time - avgTime, 2), 0) / wakeTimes.length;

  if (variance < 30 * 60 * 1000) return 'High';
  if (variance < 60 * 60 * 1000) return 'Medium';
  return 'Low';
};

const generateInsights = (logs: SleepLog[]): string[] => {
  const insights: string[] = [];
  
  if (logs.length === 0) {
    return ['Start tracking your sleep to get personalized insights!'];
  }

  const weekdayLogs = logs.filter(log => {
    const date = new Date(log.date);
    return date.getDay() !== 0 && date.getDay() !== 6;
  });

  const weekendLogs = logs.filter(log => {
    const date = new Date(log.date);
    return date.getDay() === 0 || date.getDay() === 6;
  });

  if (weekdayLogs.length > 0 && weekendLogs.length > 0) {
    const avgWeekday = weekdayLogs.reduce((sum, log) => sum + log.hours, 0) / weekdayLogs.length;
    const avgWeekend = weekendLogs.reduce((sum, log) => sum + log.hours, 0) / weekendLogs.length;
    
    if (Math.abs(avgWeekend - avgWeekday) >= 1) {
      insights.push(
        \`You sleep \${Math.abs(avgWeekend - avgWeekday).toFixed(1)}h \${
          avgWeekend > avgWeekday ? 'more' : 'less'
        } on weekends.\`
      );
    }
  }

  // Add more insights as needed

  return insights;
};