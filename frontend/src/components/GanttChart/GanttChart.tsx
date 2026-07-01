import { useMemo, useState } from 'react';
import {
  Box, Typography, Stack, Tooltip, Chip
} from '@mui/material';
import { motion } from 'framer-motion';

const DAY_WIDTH = 28;
const ROW_HEIGHT = 36;
const TABLE_WIDTH = 360;
const HEADER_HEIGHT = 48;
const STATUS_COLORS: Record<string, { bar: string; bg: string; text: string }> = {
  not_started: { bar: '#94a3b8', bg: 'rgba(148,163,184,0.15)', text: '#94a3b8' },
  in_progress: { bar: '#3b82f6', bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
  completed: { bar: '#10b981', bg: 'rgba(16,185,129,0.15)', text: '#34d399' },
  delayed: { bar: '#ef4444', bg: 'rgba(239,68,68,0.15)', text: '#fca5a5' },
};

interface Task {
  id: number | string;
  task_name: string;
  start_date?: string | Date;
  end_date?: string | Date;
  parent_id?: number | string | null;
  status?: string;
  progress_percent?: number;
  responsible?: string;
  dependencies?: string;
  is_milestone?: boolean;
  critical?: boolean;
  baseline_start?: string | Date;
  baseline_end?: string | Date;
  depth?: number;
  children?: Task[];
}

interface FlatTask extends Task {
  depth: number;
}

interface GanttChartProps {
  tasks?: Task[];
  onTaskClick?: (task: Task) => void;
}

function toDate(d: string | Date | undefined | null): Date | null {
  if (!d) return null;
  if (typeof d === 'string') return new Date(d);
  return d;
}

function diffDays(start: Date | null, end: Date | null): number {
  if (!start || !end) return 0;
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

function formatDateStr(d: string | Date | undefined | null): string {
  if (!d) return '';
  const dt = typeof d === 'string' ? new Date(d) : d;
  return dt.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
}

function buildHierarchy(tasks: Task[]): FlatTask[] {
  const map: Record<string, Task & { children: Task[] }> = {};
  const roots: (Task & { children: Task[] })[] = [];
  tasks.forEach(t => { map[t.id as string] = { ...t, children: [], depth: 0 }; });
  const ordered: FlatTask[] = [];
  tasks.forEach(t => {
    if (t.parent_id && map[t.parent_id as string]) {
      map[t.parent_id as string].children.push(map[t.id as string]);
    } else {
      roots.push(map[t.id as string]);
    }
  });
  function flatten(node: Task & { children: Task[] }, depth: number) {
    ordered.push({ ...node, depth });
    node.children.forEach(c => flatten(c as Task & { children: Task[] }, depth + 1));
  }
  roots.forEach(r => flatten(r, 0));
  return ordered;
}

export default function GanttChart({ tasks = [], onTaskClick }: GanttChartProps) {
  const [hoveredDep, setHoveredDep] = useState<number | null>(null);

  const { flatTasks, dateRange, totalDays } = useMemo(() => {
    const flat = buildHierarchy(tasks);
    let minDate = Infinity, maxDate = -Infinity;
    flat.forEach(t => {
      const s = toDate(t.start_date);
      const e = toDate(t.end_date);
      if (s && s.getTime() < minDate) minDate = s.getTime();
      if (e && e.getTime() > maxDate) maxDate = e.getTime();
    });
    if (!isFinite(minDate)) {
      const now = new Date();
      minDate = now.getTime() - 7 * 86400000;
      maxDate = now.getTime() + 30 * 86400000;
    }
    const start = new Date(minDate);
    const end = new Date(maxDate);
    const days = diffDays(start, end) + 14;
    return { flatTasks: flat, dateRange: { start, end }, totalDays: Math.max(days, 30) };
  }, [tasks]);

  const timelineWidth = totalDays * DAY_WIDTH;

  const monthHeaders = useMemo(() => {
    const headers: { label: string; start: number; width: number }[] = [];
    let cursor = new Date(dateRange.start);
    const end = new Date(dateRange.end);
    while (cursor <= end) {
      const monthStart = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const monthEnd = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);
      const startCol = Math.round((monthStart.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24));
      const daysInMonth = Math.round((monthEnd.getTime() - monthStart.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      headers.push({
        label: cursor.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        start: startCol * DAY_WIDTH,
        width: daysInMonth * DAY_WIDTH,
      });
      cursor = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1);
    }
    return headers;
  }, [dateRange]);

  const dayLines = useMemo(() => {
    const lines: { x: number; isWeekStart: boolean }[] = [];
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(dateRange.start.getTime() + i * 86400000);
      if (d.getDay() === 0 || d.getDate() === 1) {
        lines.push({ x: i * DAY_WIDTH, isWeekStart: d.getDay() === 0 });
      }
    }
    return lines;
  }, [totalDays, dateRange]);

  const dependencies = useMemo(() => {
    const deps: { x1: number; y1: number; x2: number; y2: number; from: string; to: string }[] = [];
    flatTasks.forEach(t => {
      if (!t.dependencies) return;
      t.dependencies.split(',').forEach(depStr => {
        const depId = parseInt(depStr.trim());
        if (!depId) return;
        const depTask = flatTasks.find(f => f.id === depId);
        if (!depTask) return;
        const depEnd = toDate(depTask.end_date);
        const taskStart = toDate(t.start_date);
        if (!depEnd || !taskStart) return;
        const x1 = diffDays(dateRange.start, depEnd) * DAY_WIDTH;
        const x2 = diffDays(dateRange.start, taskStart) * DAY_WIDTH;
        const y1 = flatTasks.indexOf(depTask) * ROW_HEIGHT + ROW_HEIGHT / 2;
        const y2 = flatTasks.indexOf(t) * ROW_HEIGHT + ROW_HEIGHT / 2;
        deps.push({ x1, y1, x2, y2, from: depTask.task_name, to: t.task_name });
      });
    });
    return deps;
  }, [flatTasks, dateRange]);

  const nowX = useMemo(() => {
    return diffDays(dateRange.start, new Date()) * DAY_WIDTH;
  }, [dateRange]);

  return (
    <Box sx={{ overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
      <Box sx={{ display: 'flex', minWidth: TABLE_WIDTH + timelineWidth }}>
        {/* Tree Table */}
        <Box sx={{ width: TABLE_WIDTH, flexShrink: 0, borderRight: '1px solid', borderColor: 'divider' }}>
          <Box sx={{ height: HEADER_HEIGHT, display: 'flex', alignItems: 'center', px: 2, bgcolor: 'action.hover', borderBottom: '2px solid', borderColor: 'divider' }}>
            <Typography variant="caption" fontWeight={700} color="text.secondary">Task Name</Typography>
          </Box>
          {flatTasks.map((task, idx) => {
            const statusColor = STATUS_COLORS[task.status || ''] || STATUS_COLORS.not_started;
            return (
              <Box
                key={task.id}
                onClick={() => onTaskClick?.(task)}
                sx={{
                  height: ROW_HEIGHT, display: 'flex', alignItems: 'center', px: 2, cursor: 'pointer',
                  borderBottom: '1px solid', borderColor: 'divider',
                  bgcolor: idx % 2 === 0 ? 'background.default' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' },
                  pl: 2 + task.depth * 2,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
                  {task.is_milestone && (
                    <Chip label="M" size="small" sx={{ height: 18, fontSize: 10, bgcolor: '#f59e0b', color: 'white' }} />
                  )}
                  {task.critical && (
                    <Chip label="Critical" size="small" sx={{ height: 18, fontSize: 10, bgcolor: '#ef4444', color: 'white' }} />
                  )}
                  <Tooltip title={`${task.task_name} (${task.responsible || 'unassigned'})`}>
                    <Typography variant="body2" noWrap sx={{ fontWeight: task.parent_id ? 400 : 600 }}>
                      {task.task_name}
                    </Typography>
                  </Tooltip>
                </Stack>
              </Box>
            );
          })}
        </Box>

        {/* Timeline */}
        <Box sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Month headers */}
          <Box sx={{ height: HEADER_HEIGHT, display: 'flex', borderBottom: '2px solid', borderColor: 'divider', bgcolor: 'action.hover' }}>
            {monthHeaders.map((m, i) => (
              <Box key={i} sx={{ width: m.width, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid', borderColor: 'divider' }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" fontSize={10}>{m.label}</Typography>
              </Box>
            ))}
          </Box>

          {/* SVG for dependency arrows */}
          <svg
            style={{ position: 'absolute', top: HEADER_HEIGHT, left: 0, width: timelineWidth, height: flatTasks.length * ROW_HEIGHT, pointerEvents: 'none', zIndex: 2 }}
          >
            {dependencies.map((dep, idx) => (
              <g key={idx}
                onMouseEnter={() => setHoveredDep(idx)}
                onMouseLeave={() => setHoveredDep(null)}
                style={{ cursor: 'pointer' }}
              >
                <line
                  x1={dep.x1} y1={dep.y1} x2={dep.x2} y2={dep.y2}
                  stroke={hoveredDep === idx ? '#3b82f6' : '#94a3b8'}
                  strokeWidth={hoveredDep === idx ? 2.5 : 1.5}
                  markerEnd="url(#arrowhead)"
                />
                {hoveredDep === idx && (
                  <text x={(dep.x1 + dep.x2) / 2} y={(dep.y1 + dep.y2) / 2 - 8}
                    textAnchor="middle" fontSize={9} fill="#3b82f6">
                    {dep.from} → {dep.to}
                  </text>
                )}
              </g>
            ))}
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
                <polygon points="0 0, 8 3, 0 6" fill="#94a3b8" />
              </marker>
            </defs>
          </svg>

          {/* Day columns and bars */}
          <Box sx={{ position: 'relative', width: timelineWidth }}>
            {/* Day lines */}
            {dayLines.map((line, i) => (
              <Box key={i} sx={{ position: 'absolute', left: line.x, top: 0, width: 1, height: flatTasks.length * ROW_HEIGHT, bgcolor: line.isWeekStart ? 'rgba(148,163,184,0.2)' : 'rgba(148,163,184,0.08)', zIndex: 0 }} />
            ))}

            {/* Today line */}
            {nowX > 0 && nowX < timelineWidth && (
              <Box sx={{ position: 'absolute', left: nowX, top: 0, width: 2, height: flatTasks.length * ROW_HEIGHT, bgcolor: '#ef4444', zIndex: 3, '&::before': { content: '"Today"', position: 'absolute', top: -14, left: -12, fontSize: 8, color: '#ef4444', fontWeight: 700 } }} />
            )}

            {/* Gantt bars */}
            {flatTasks.map((task, idx) => {
              const start = toDate(task.start_date);
              const end = toDate(task.end_date);
              if (!start || !end) return <Box key={task.id} sx={{ height: ROW_HEIGHT, borderBottom: '1px solid', borderColor: 'divider' }} />;
              const colStart = diffDays(dateRange.start, start);
              const duration = diffDays(start, end);
              const left = colStart * DAY_WIDTH;
              const width = Math.max(duration * DAY_WIDTH, 8);
              const top = idx * ROW_HEIGHT + 8;
              const barHeight = ROW_HEIGHT - 16;
              const statusColor = STATUS_COLORS[task.status || ''] || STATUS_COLORS.not_started;
              const progress = Number(task.progress_percent) || 0;

              return (
                <Box key={task.id} sx={{ height: ROW_HEIGHT, borderBottom: '1px solid', borderColor: 'divider', position: 'relative' }}>
                  {/* Critical path indicator */}
                  {task.critical && (
                    <Box sx={{ position: 'absolute', left: 0, top: 0, width: 3, height: '100%', bgcolor: '#ef4444', zIndex: 5, borderRadius: '0 2px 2px 0' }} />
                  )}
                  {/* Baseline bar */}
                  {task.baseline_start && task.baseline_end && (
                    <Tooltip title={`Baseline: ${formatDateStr(task.baseline_start)} - ${formatDateStr(task.baseline_end)}`}>
                      <Box sx={{
                        position: 'absolute', top: top + barHeight + 4, left: diffDays(dateRange.start, toDate(task.baseline_start)) * DAY_WIDTH,
                        width: Math.max(diffDays(toDate(task.baseline_start), toDate(task.baseline_end)) * DAY_WIDTH, 4),
                        height: 4, bgcolor: 'rgba(148,163,184,0.3)', borderRadius: 1, zIndex: 1,
                      }} />
                    </Tooltip>
                  )}

                  {/* Main bar */}
                  <Tooltip title={`${task.task_name}: ${formatDateStr(start)} - ${formatDateStr(end)} (${progress}%)`}>
                    <Box
                      sx={{
                        position: 'absolute', left, top, width, height: barHeight,
                        borderRadius: 1, overflow: 'hidden', cursor: 'pointer', zIndex: 1,
                        bgcolor: statusColor.bar + '33',
                        border: `1.5px solid ${statusColor.bar}`,
                        '&:hover': { opacity: 0.85 },
                      }}
                    >
                      {/* Progress fill */}
                      <Box sx={{
                        width: `${progress}%`, height: '100%',
                        bgcolor: statusColor.bar,
                        transition: 'width 0.3s',
                      }} />
                      {/* Label */}
                      <Typography variant="caption" sx={{
                        position: 'absolute', left: 4, top: '50%', transform: 'translateY(-50%)',
                        fontSize: 9, fontWeight: 600, color: '#1e293b', whiteSpace: 'nowrap',
                        textShadow: '0 0 3px rgba(255,255,255,0.8)',
                      }}>
                        {formatDateStr(start)} - {formatDateStr(end)}
                      </Typography>
                    </Box>
                  </Tooltip>

                  {/* Milestone diamond */}
                  {task.is_milestone && (
                    <Box sx={{
                      position: 'absolute', left: left - 6, top: top + 2,
                      width: 12, height: 12, transform: 'rotate(45deg)',
                      bgcolor: '#f59e0b', border: '2px solid white', zIndex: 2,
                      borderRadius: 0.5,
                    }} />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
