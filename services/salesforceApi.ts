export async function sendToSalesforce(csvData: string[][]): Promise<{ success: boolean; message: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful API call
    return { success: true, message: 'Data successfully sent to Salesforce' };
  }
  
  