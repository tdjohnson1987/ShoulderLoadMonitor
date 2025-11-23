// Kalman Filter implementation for smoothing sensor data
export class KalmanFilter {
    private R: number; // Measurement noise covariance
    private Q: number; // Process noise covariance
    private A: number; // State transition coefficient
    private B: number; // Control input coefficient
    private C: number; // Measurement coefficient

    private cov: number     ; // Covariance
    private x: number      ; // State

    constructor(R: number, Q: number, A = 1, B = 0, C = 1) {
        this.R = R;
        this.Q = Q;
        this.A = A;
        this.B = B;
        this.C = C;
        this.cov = NaN;
        this.x = NaN;
    }

    public filter(z: number, u = 0): number {
        if (isNaN(this.x)) {
            this.x = (1 / this.C) * z;
            this.cov = (1 / this.C) * this.R * (1 / this.C);
        } else {
            // Prediction step
            const predX = this.A * this.x + this.B * u;
            const predCov = this.A * this.cov * this.A + this.Q;

            // Kalman Gain
            const K = predCov * this.C * (1 / (this.C * predCov * this.C + this.R));

            // Correction step
            this.x = predX + K * (z - this.C * predX);
            this.cov = predCov - K * this.C * predCov;
        }
        return this.x;
    }

    public lastMeasurement(): number {
        return this.x;
    }

    public setState(x: number, cov: number): void {
        this.x = x;
        this.cov = cov;
    }
}


export default KalmanFilter;

