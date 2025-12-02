// ../ExportService.ts
/**
 * Export Service
 * Handles exporting sensor data and angle calculations to CSV files.
 */

export class ExportService {
  /**
   * Convert sensor data to CSV format
   * @param data Array of sensor data objects
   * @returns CSV string
   */
  static convertToCSV(data: any[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(row => 
      Object.values(row).join(',')
    );

    return [headers, ...rows].join('\n');
  }

  /**
   * Save CSV data to a file
   * @param csvData CSV string
   * @param filename Desired filename
   */
  static async saveCSVToFile(csvData: string, filename: string): Promise<void> {
    // Implementation depends on the platform (e.g., React Native FS, web download, etc.)
    // Placeholder for file saving logic
    console.log(`Saving CSV to ${filename}:\n${csvData}`);
  }
}   

/** Create Shoulder Load report */

// Plot sensor data and angle data from CSV and create report


export async function createShoulderLoadReport(sensorData: any[], angleData: any[]): Promise<void> {
  const sensorCSV = ExportService.convertToCSV(sensorData);
  const angleCSV = ExportService.convertToCSV(angleData);

  await ExportService.saveCSVToFile(sensorCSV, 'sensor_data.csv');
  await ExportService.saveCSVToFile(angleCSV, 'angle_data.csv');
}   

