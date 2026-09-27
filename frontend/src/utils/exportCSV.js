import { formatCurrency, formatDate } from './calculateTotals';

export const exportToCSV = (data, filename, fields) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Define default fields if not provided
  const exportFields = fields || Object.keys(data[0]);
  
  // Convert data to CSV format
  const csvContent = [
    exportFields.join(','), // Header row
    ...data.map(item => 
      exportFields.map(field => {
        let value = item[field];
        
        // Format specific field types
        if (typeof value === 'number' && field.toLowerCase().includes('amount')) {
          value = formatCurrency(value).replace('UGX', '').trim();
        }
        if (typeof value === 'string' && field.toLowerCase().includes('date')) {
          value = formatDate(value);
        }
        
        // Handle values with commas
        return `"${String(value || '').replace(/"/g, '""')}"`;
      }).join(',')
    )
  ].join('\n');

  // Create download link
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};