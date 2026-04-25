export class ApiResponse<T> {
    success: boolean;
    message: string;
    statusCode: number;
    data: T | null;
    timestamp: string;

    constructor(success: boolean, message: string, statusCode: number, data: T | null) {
        this.success = success;
        this.message = message;
        this.statusCode = statusCode;
        this.data = data;
        this.timestamp = new Date().toISOString();
    }

    static of<T>(success: boolean, data: T, message = 'Success', statusCode = 200): ApiResponse<T> {
        return new ApiResponse<T>(success, message, statusCode, data);
    }


}