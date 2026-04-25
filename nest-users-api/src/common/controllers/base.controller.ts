import { Logger } from "@nestjs/common";
import { ApiResponse } from "../dto/response/ApiResponse";

export class BaseController {
    protected readonly logger = new Logger(this.constructor.name);


    protected makeResponse<T>(success: boolean, data: T | null = null, message = 'Success', statusCode = 200) {
        return ApiResponse.of<T | null>(success, data, message, statusCode);
    }
}