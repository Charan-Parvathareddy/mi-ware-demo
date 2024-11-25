import { useState } from 'react';
import { parseCSV } from '@/lib/csvParser';

export function useFileUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<string[][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (uploadedFile: File) => {
    setIsLoading(true);
    setError(null);
    try {
      const parsedData = await parseCSV(uploadedFile);
      setFile(uploadedFile);
      setCsvData(parsedData);
    } catch (err) {
      setError('Error parsing CSV file');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return { file, csvData, isLoading, error, handleFileUpload };
}

