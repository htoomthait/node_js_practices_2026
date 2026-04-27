
export class GeneratedTokenDto {

    userId?: number;

    email?: string;

    role?: string;

    accessToken?: string;

    accessTokenExpireAfter?: Date;

    refreshToken?: string;

    refreshTokenExpireAfter?: Date;


    static fromData(
        userId: number,
        email: string,
        role: string,
        accessToken: string,
        accessTokenExpireAfter: Date,
        refreshToken: string,
        refreshTokenExpireAfter: Date
    ): GeneratedTokenDto {

        const dto = new GeneratedTokenDto();
        dto.userId = userId;
        dto.email = email;
        dto.role = role;
        dto.accessToken = accessToken;
        dto.accessTokenExpireAfter = accessTokenExpireAfter;
        dto.refreshToken = refreshToken;
        dto.refreshTokenExpireAfter = refreshTokenExpireAfter;

        return dto;

    }
}