import React, { useState, useCallback } from 'react';
import { RefreshCw, Calendar } from 'lucide-react';

interface TopologyControlsProps {
  startTime: string;
  endTime: string;
  onTimeRangeChange: (startTime: string, endTime: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

// 预定义时间范围选项
const TIME_RANGES = [
  { label: '最近1小时', value: 'hour', hours: 1 },
  { label: '今天', value: 'today' },
  { label: '昨天', value: 'yesterday' },
  { label: '最近7天', value: '7days', days: 7 },
  { label: '最近30天', value: '30days', days: 30 },
  { label: '自定义', value: 'custom' }
];

export function TopologyControls({
  startTime,
  endTime,
  onTimeRangeChange,
  onRefresh,
  isLoading
}: TopologyControlsProps) {
  const [activeRange, setActiveRange] = useState('7days');
  const [isCustom, setIsCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  // 处理预定义时间范围选择
  const handleRangeSelect = useCallback((rangeValue: string) => {
    const now = new Date();
    let start = new Date();
    let end = new Date();
    
    if (rangeValue === 'custom') {
      setIsCustom(true);
      setActiveRange('custom');
      // 保持当前选择的时间范围
      return;
    }
    
    setIsCustom(false);
    setActiveRange(rangeValue);
    
    // 计算选定的时间范围
    switch (rangeValue) {
      case 'hour':
        start.setHours(now.getHours() - 1);
        break;
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(now.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(now.getDate());
        end.setHours(0, 0, 0, 0);
        break;
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      default:
        break;
    }
    
    onTimeRangeChange(start.toISOString(), end.toISOString());
  }, [onTimeRangeChange]);

  // 处理自定义时间范围变更
  const handleCustomRangeChange = useCallback(() => {
    if (customStart && customEnd) {
      const startDate = new Date(customStart);
      const endDate = new Date(customEnd);
      
      if (startDate && endDate && startDate <= endDate) {
        // 设置结束时间为当天结束
        endDate.setHours(23, 59, 59, 999);
        onTimeRangeChange(startDate.toISOString(), endDate.toISOString());
      }
    }
  }, [customStart, customEnd, onTimeRangeChange]);

  // 格式化日期
  const formatDateForInput = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    
    // 格式化为YYYY-MM-DD
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {TIME_RANGES.map(range => (
            <button
              key={range.value}
              onClick={() => handleRangeSelect(range.value)}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                activeRange === range.value 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-secondary hover:bg-secondary/80 text-foreground'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
        
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>{isLoading ? '刷新中...' : '刷新'}</span>
        </button>
      </div>
      
      {isCustom && (
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div>
            <label htmlFor="start-date" className="block text-sm text-muted-foreground mb-1">开始日期</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="start-date"
                type="date"
                value={customStart || formatDateForInput(startTime)}
                onChange={(e) => setCustomStart(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-border rounded-md bg-background text-foreground text-sm"
              />
            </div>
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm text-muted-foreground mb-1">结束日期</label>
            <div className="relative">
              <Calendar className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                id="end-date"
                type="date"
                value={customEnd || formatDateForInput(endTime)}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="pl-8 pr-3 py-1.5 border border-border rounded-md bg-background text-foreground text-sm"
              />
            </div>
          </div>
          <button
            onClick={handleCustomRangeChange}
            className="px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md transition-colors text-sm h-9"
          >
            应用
          </button>
        </div>
      )}
    </div>
  );
}