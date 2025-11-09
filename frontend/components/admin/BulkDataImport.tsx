'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { importApi, CSVPreviewResult, CSVImportResult } from '@/lib/api/import';

type ImportStep = 'upload' | 'preview' | 'importing' | 'complete';

export default function BulkDataImport() {
  const [step, setStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<CSVPreviewResult | null>(null);
  const [importResult, setImportResult] = useState<CSVImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
    setPreviewData(null);
    setImportResult(null);
    setStep('upload');
  };

  const handlePreview = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const result = await importApi.previewSalesCSV(selectedFile);
      setPreviewData(result);
      setStep('preview');

      if (result.valid) {
        toast.success(`Preview successful! ${result.estimatedSales} sales ready to import`);
      } else {
        toast.error(`Validation failed with ${result.errors.length} error(s)`);
      }
    } catch (error: any) {
      console.error('Preview failed:', error);
      toast.error(error.response?.data?.message || 'Failed to preview CSV file');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !previewData?.valid) return;

    setLoading(true);
    setStep('importing');
    setUploadProgress(0);

    try {
      const result = await importApi.importSalesCSV(selectedFile, (progressEvent: any) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      setImportResult(result);
      setStep('complete');

      toast.success(
        `Successfully imported ${result.salesCreated} sales and created ${result.customersCreated} customers!`
      );
    } catch (error: any) {
      console.error('Import failed:', error);
      toast.error(error.response?.data?.message || 'Failed to import CSV file');
      setStep('preview');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setStep('upload');
    setSelectedFile(null);
    setPreviewData(null);
    setImportResult(null);
    setUploadProgress(0);
  };

  const downloadTemplate = async () => {
    try {
      await importApi.downloadCSVTemplate('sales');
      toast.success('Template downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Failed to download template');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Bulk Sales Import</h3>
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
              <li>Upload the completed CSV file</li>
              <li>Review the preview and fix any errors</li>
              <li>Click "Import Sales" to complete the import</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Download Template Button */}
      <div className="mb-6">
        <Button variant="secondary" onClick={downloadTemplate}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download CSV Template
        </Button>
      </div>

      {/* File Upload */}
      {step === 'upload' && (
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
                <p className="text-xs text-gray-500">CSV files only (max 10MB)</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={handleFileSelect}
              />
            </label>
          </div>
          {selectedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">{(selectedFile.size / 1024).toFixed(2)} KB</p>
                  </div>
                </div>
                <Button variant="primary" onClick={handlePreview} disabled={loading}>
                  {loading ? 'Validating...' : 'Preview & Validate'}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Preview Results */}
      {step === 'preview' && previewData && (
        <div className="mb-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Preview Results</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Rows</p>
                <p className="text-2xl font-bold text-gray-900">{previewData.totalRows}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sales</p>
                <p className="text-2xl font-bold text-indigo-600">{previewData.estimatedSales}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customers</p>
                <p className="text-2xl font-bold text-green-600">{previewData.estimatedCustomers}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className={`text-2xl font-bold ${previewData.valid ? 'text-green-600' : 'text-red-600'}`}>
                  {previewData.valid ? '✓ Valid' : '✗ Invalid'}
                </p>
              </div>
            </div>
          </div>

          {/* Errors */}
          {previewData.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-red-900 mb-2">
                {previewData.errors.length} Error(s) Found
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {previewData.errors.map((error, index) => (
                  <div key={index} className="text-sm text-red-800 bg-white p-2 rounded">
                    <span className="font-medium">Row {error.row}, {error.column}:</span> {error.message}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {previewData.warnings.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                {previewData.warnings.length} Warning(s)
              </h4>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {previewData.warnings.slice(0, 5).map((warning, index) => (
                  <div key={index} className="text-sm text-yellow-800 bg-white p-2 rounded">
                    <span className="font-medium">Row {warning.row}, {warning.column}:</span> {warning.message}
                  </div>
                ))}
                {previewData.warnings.length > 5 && (
                  <p className="text-xs text-yellow-700">...and {previewData.warnings.length - 5} more warnings</p>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <Button variant="secondary" onClick={handleReset}>
              Cancel & Choose Different File
            </Button>
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={!previewData.valid || loading}
            >
              {loading ? 'Importing...' : 'Import Sales'}
            </Button>
          </div>
        </div>
      )}

      {/* Importing Progress */}
      {step === 'importing' && (
        <div className="mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-blue-900 mb-4">Importing Sales Data...</h4>
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-blue-800 text-center">{uploadProgress}% uploaded</p>
          </div>
        </div>
      )}

      {/* Import Complete */}
      {step === 'complete' && importResult && (
        <div className="mb-6 space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h4 className="text-xl font-bold text-green-900">Import Successful!</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Sales Imported</p>
                <p className="text-2xl font-bold text-green-600">{importResult.salesCreated}</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Customers Created</p>
                <p className="text-2xl font-bold text-indigo-600">{importResult.customersCreated}</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Total Sales Amount</p>
                <p className="text-2xl font-bold text-gray-900">${importResult.summary.totalSalesAmount.toFixed(2)}</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-sm text-gray-600">Total FCP</p>
                <p className="text-2xl font-bold text-purple-600">${importResult.summary.totalFCP.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Sales by Salesperson */}
          {importResult.summary.salesBySalesperson.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Sales by Salesperson</h4>
              <div className="space-y-2">
                {importResult.summary.salesBySalesperson.map((sp, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700">{sp.salesperson}</span>
                    <span className="text-sm font-bold text-indigo-600">${sp.totalSales.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button variant="primary" onClick={handleReset} className="w-full">
            Import Another File
          </Button>
        </div>
      )}
    </div>
  );
}
