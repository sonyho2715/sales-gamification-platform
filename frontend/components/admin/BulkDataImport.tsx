'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';

export default function BulkDataImport() {
  const [csvData, setCsvData] = useState('');
  const [loading, setLoading] = useState(false);

  const exampleCSV = `Transaction #,Date,Time,Location,Salesperson,Customer,Total Amount,FCP Amount,Hours Worked
TXN-001,2025-01-07,14:30,Albany,John Doe,Customer A,1500.00,750.00,8
TXN-002,2025-01-07,15:45,Coos Bay,Jane Smith,Customer B,2300.00,1150.00,8
TXN-003,2025-01-07,16:20,Gateway,Bob Johnson,Customer C,1800.00,900.00,8`;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvData(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!csvData.trim()) {
      toast.error('Please enter CSV data or upload a file');
      return;
    }

    setLoading(true);
    try {
      // Parse CSV data
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());

      const sales = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const sale: any = {};

        headers.forEach((header, index) => {
          sale[header] = values[index];
        });

        sales.push(sale);
      }

      // For now, show what would be imported
      console.log('Parsed sales:', sales);

      toast.success(`Successfully parsed ${sales.length} sales transactions!`);
      toast('Note: Bulk import API endpoint needs to be implemented', { icon: 'ℹ️' });

      // TODO: Implement bulk import API endpoint
      // await apiClient.post('/sales/bulk', { sales });

    } catch (error: any) {
      console.error('Failed to import sales:', error);
      toast.error('Failed to parse CSV data. Please check the format.');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([exampleCSV], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales-import-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Bulk Data Import</h3>
        <p className="text-gray-600">Upload multiple sales transactions at once using CSV format</p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex">
          <svg className="w-5 h-5 text-blue-500 mr-3 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-800">
            <p className="font-semibold mb-2">How to use bulk import:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Download the CSV template using the button below</li>
              <li>Fill in your sales data following the template format</li>
              <li>Upload the completed CSV file or paste the data below</li>
              <li>Click "Import Sales" to process the data</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Download Template Button */}
      <div className="mb-6">
        <Button
          variant="secondary"
          onClick={downloadTemplate}
        >
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download CSV Template
        </Button>
      </div>

      {/* File Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Upload CSV File
        </label>
        <div className="flex items-center justify-center w-full">
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">CSV files only</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".csv"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      </div>

      {/* CSV Data Textarea */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Or Paste CSV Data
        </label>
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          rows={12}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
          placeholder={exampleCSV}
        />
      </div>

      {/* Preview */}
      {csvData && (
        <div className="mb-6 bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Preview</h4>
          <p className="text-sm text-gray-600">
            {csvData.split('\n').length - 1} transaction(s) will be imported
          </p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          variant="secondary"
          onClick={() => setCsvData('')}
        >
          Clear
        </Button>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={loading || !csvData.trim()}
        >
          {loading ? 'Importing...' : 'Import Sales'}
        </Button>
      </div>

      {/* Example Format */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">CSV Format Example:</h4>
        <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
          <pre className="text-green-400 text-xs font-mono">
{exampleCSV}
          </pre>
        </div>
      </div>
    </div>
  );
}
