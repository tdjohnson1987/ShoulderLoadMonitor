// ../EWMAFilter.ts
/**
 * Exponentially Weighted Moving Average (EWMA) Filter
 * This filter smooths noisy data by applying an exponential decay to past observations.
 */

export class EWMAFilter {
  private alpha: number; // Smoothing factor
  private lastValue: number | null; // Last filtered value

  constructor(alpha: number = 0.1) {
    this.alpha = alpha;
    this.lastValue = null; // No initial value
  }

  /**
   * Update the filter with a new data point
   * @param newValue The new data point to filter
   * @returns The filtered value
   */
  update(newValue: number): number {
    if (this.lastValue === null) {
      this.lastValue = newValue; // Initialize with the first value
    } else {
      this.lastValue = this.alpha * newValue + (1 - this.alpha) * this.lastValue;
    }
    return this.lastValue;
  }
}