'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function Home() {
  const [direction, setDirection] = useState<'csvToSalesforce' | 'salesforceToCsv'>('csvToSalesforce')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  const handleFileUpload = async (uploadedFile: File) => {
    setFile(uploadedFile)
    const text = await uploadedFile.text()
    const lines = text.split('\n')
    const parsedData = lines.map(line => line.split(','))
    setPreview(parsedData.slice(0, 6)) // Include header + 5 rows
  }

  const handleSubmit = async () => {
    if (!file) return

    setIsLoading(true)
    try {
      // Simulating API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setSuccessMessage(`File successfully ${direction === 'csvToSalesforce' ? 'sent to' : 'received from'} Salesforce`)
      setIsModalOpen(true)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Salesforce CSV Transfer</h1>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="direction">Transfer Direction</Label>
          <Select onValueChange={(value: 'csvToSalesforce' | 'salesforceToCsv') => setDirection(value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="csvToSalesforce">CSV to Salesforce</SelectItem>
              <SelectItem value="salesforceToCsv">Salesforce to CSV</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="file-upload">Upload CSV File</Label>
          <Input
            id="file-upload"
            type="file"
            accept=".csv"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
            disabled={isLoading}
          />
        </div>

        {preview.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-2">File Preview (Top 5 Rows)</h2>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    {preview[0].map((header, index) => (
                      <TableHead key={index}>{header}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.slice(1).map((row, rowIndex) => (
                    <TableRow key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <TableCell key={cellIndex}>{cell}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!file || isLoading}
          className="w-full"
        >
          {isLoading ? 'Processing...' : direction === 'csvToSalesforce' ? 'Send to Salesforce' : 'Receive from Salesforce'}
        </Button>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Success</DialogTitle>
          </DialogHeader>
          <p>{successMessage}</p>
        </DialogContent>
      </Dialog>
    </div>
  )
}

