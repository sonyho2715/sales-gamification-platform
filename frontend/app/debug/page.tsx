'use client';

export default function DebugPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'NOT SET';
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'NOT SET';

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Debug</h1>
      <div className="space-y-2">
        <p><strong>NEXT_PUBLIC_API_URL:</strong> {apiUrl}</p>
        <p><strong>NEXT_PUBLIC_WS_URL:</strong> {wsUrl}</p>
      </div>
    </div>
  );
}
