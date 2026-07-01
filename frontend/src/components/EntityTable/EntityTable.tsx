import { Box, Typography, Stack, IconButton, TablePagination } from '@mui/material';
import { motion } from 'framer-motion';
import { MouseEvent, ReactNode } from 'react';
import Icon from '../SvgIcon/SvgIcon';
import ChartSkeleton from '../Skeleton/ChartSkeleton';

interface Column {
  field: string;
  label?: string;
  headerName?: string;
  type?: string;
  align?: string;
  width?: string | number;
  minWidth?: string | number;
  renderCell?: (params: { row: any; value: any }) => ReactNode;
}

interface EntityTableProps {
  columns?: Column[];
  rows?: any[];
  loading?: boolean;
  total?: number;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  emptyMessage?: string;
  renderRow?: (row: any) => ReactNode;
}

export default function EntityTable({
  columns = [],
  rows = [],
  loading = false,
  total = 0,
  page = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onEdit,
  onDelete,
  emptyMessage = 'No data',
  renderRow,
}: EntityTableProps) {
  if (loading) return <ChartSkeleton />;

  if (!rows.length) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Icon name="list" size={48} />
        <Typography variant="body2" sx={{ color: 'var(--clr-text-secondary)', mt: 1 }}>{emptyMessage}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.field || i}
                  style={{
                    textAlign: (col.align as any) || 'left',
                    padding: '12px 16px',
                    fontWeight: 600,
                    fontSize: '0.7rem',
                    color: 'var(--clr-text-secondary)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    borderBottom: '1px solid var(--clr-border)',
                    whiteSpace: 'nowrap',
                    width: col.width as any,
                    minWidth: col.minWidth as any,
                  }}
                >
                  {col.label || col.headerName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <motion.tr
                key={row.id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: rowIndex * 0.02 }}
                style={{
                  borderBottom: '1px solid var(--clr-border)',
                  transition: 'background-color 150ms ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e: MouseEvent<HTMLTableRowElement>) => { e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.02)'; }}
                onMouseLeave={(e: MouseEvent<HTMLTableRowElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {columns.map((col) => {
                  const cellValue = row[col.field];
                  const rendered = col.renderCell
                    ? col.renderCell({ row, value: cellValue })
                    : (col.type === 'date'
                      ? (cellValue ? new Date(cellValue).toLocaleDateString() : '-')
                      : (cellValue ?? '-'));
                  return (
                    <td
                      key={col.field}
                      style={{
                        padding: '10px 16px',
                        fontSize: col.type === 'number' ? '0.8125rem' : '0.8rem',
                        fontWeight: col.type === 'number' ? 700 : 400,
                        textAlign: (col.align as any) || 'left',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {rendered}
                    </td>
                  );
                })}
                {(onEdit || onDelete) && (
                  <td style={{ padding: '6px 16px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                      {onEdit && (
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onEdit(row); }}
                          sx={{ color: 'var(--clr-gold-500)', bgcolor: 'rgba(217,119,6,0.08)', width: 28, height: 28 }}>
                          <Icon name="edit" size={14} />
                        </IconButton>
                      )}
                      {onDelete && (
                        <IconButton size="small" onClick={(e) => { e.stopPropagation(); onDelete(row); }}
                          sx={{ color: 'var(--clr-red-500)', bgcolor: 'rgba(239,68,68,0.08)', width: 28, height: 28 }}>
                          <Icon name="trash" size={14} />
                        </IconButton>
                      )}
                    </Stack>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </Box>
      {total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, p) => onPageChange?.(p)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => onPageSizeChange?.(parseInt(e.target.value, 10))}
          rowsPerPageOptions={[10, 20, 50]}
          sx={{
            '.MuiTablePagination-toolbar': { color: 'var(--clr-text-secondary)', fontSize: '0.75rem' },
            '.MuiTablePagination-selectIcon': { color: 'var(--clr-text-secondary)' },
            '.MuiTablePagination-actions button': { color: 'var(--clr-text-secondary)' },
          }}
        />
      )}
    </Box>
  );
}
