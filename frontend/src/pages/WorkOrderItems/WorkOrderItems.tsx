import React from 'react';
import { useTheme } from '@mui/material';
import EntityPage from '../EntityPage';
import { workOrderItemsService } from '../../services/api';

const columns = [
  { field: 'item_code', headerName: 'itemCode', width: 110 },
  { field: 'description', headerName: 'description', flex: 1.5 },
  { field: 'work_order_id', headerName: 'workOrders', type: 'number', width: 90 },
  { field: 'unit', headerName: 'unit', width: 70 },
  { field: 'quantity', headerName: 'quantity', type: 'number', width: 90 },
  { field: 'unit_price', headerName: 'unitPrice', type: 'number', width: 100 },
  { field: 'total_price', headerName: 'totalPrice', type: 'number', width: 110 },
  { field: 'executed_quantity', headerName: 'executedQuantity', type: 'number', width: 110 },
  { field: 'status', headerName: 'status', width: 90 },
];

const fields = [
  { name: 'work_order_id', label: 'workOrders', type: 'number', required: true },
  { name: 'item_code', label: 'itemCode', required: true },
  { name: 'description', label: 'description' },
  { name: 'unit', label: 'unit' },
  { name: 'quantity', label: 'quantity', type: 'number' },
  { name: 'unit_price', label: 'unitPrice', type: 'number' },
  { name: 'executed_quantity', label: 'executedQuantity', type: 'number' },
  { name: 'status', label: 'status', options: [{ value: 'pending', label: 'pending' }, { value: 'partial', label: 'partial' }, { value: 'done', label: 'done' }] },
];

const WorkOrderItems: React.FC = () => {
  const theme = useTheme();
  return <EntityPage service={workOrderItemsService} columns={columns} fields={fields} title="workOrderItems" accentColor={theme.palette.secondary.main} />;
};

export default WorkOrderItems;
