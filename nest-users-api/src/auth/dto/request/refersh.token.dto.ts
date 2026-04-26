import { IsNotEmpty } from "class-validator";

export class RefreshTokenDto {

    @IsNotEmpty({ message: "User ID is required" })
    userId!: number;

    @IsNotEmpty({ message: "Refresh token is required" })
    refreshToken!: string;
}