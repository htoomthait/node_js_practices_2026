import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/request/login.dto';
import { RegisterDto } from './dto/request/register.dto';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import ms, { StringValue } from "ms";
import { RefreshTokenDto } from './dto/request/refersh.token.dto';
import { GeneratedTokenDto } from './dto/response/generated-token.dto';
import { AppConfig } from 'src/config/app.config';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private readonly appConfig: AppConfig,
    ) { }

    protected readonly logger = new Logger(AuthService.name);

    public async register(
        dto: RegisterDto,
    ): Promise<GeneratedTokenDto> {
        try {
            const user = await this.prisma.$transaction(async (tx) => {
                const existingUser = await tx.user.findUnique({
                    where: { email: dto.email },
                });

                if (existingUser) {
                    throw new ConflictException(
                        'User with this email already exists',
                    );
                }

                const hashedPassword = await bcrypt.hash(
                    dto.password,
                    10,
                );

                return tx.user.create({
                    data: {
                        fullname: dto.fullname,
                        email: dto.email,
                        password: hashedPassword,
                        phoneNumber: dto.phoneNumber,
                        dob: new Date(dto.dob),
                        role: 'USER',
                    },
                });
            });

            // Transaction committed already here
            return await this.generateTokens(
                user.id,
                user.email,
                user.role,
            );
        } catch (error) {
            this.logger.error(
                'Error during registration',
                error,
            );

            if (error instanceof ConflictException) {
                throw error;
            }

            throw new UnauthorizedException(
                'Registration failed',
            );
        }
    }

    public async login(dto: LoginDto): Promise<GeneratedTokenDto> {


        try {
            const user = await this.prisma.$transaction(async (tx) => {
                const user = await tx.user.findUnique({
                    where: { email: dto.email }
                });

                if (!user || !user.password) {
                    throw new UnauthorizedException('Invalid credentials');
                }

                const matched = await bcrypt.compare(dto.password, user.password);

                if (!matched) throw new UnauthorizedException('Invalid credentials');

                return user;
            });

            return await this.generateTokens(user.id, user.email, user.role);
        } catch (error) {
            this.logger.error('Error during login', error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException('Login operation failed');
        }
    }

    public async refreshTokens(dto: RefreshTokenDto): Promise<GeneratedTokenDto> {

        try {

            const user = await this.prisma.$transaction(async (tx) => {
                const refreshTokenSecret = this.appConfig.jwtRefreshTokenSecret;

                const payload = await this.jwtService.verifyAsync(dto.refreshToken, {
                    secret: refreshTokenSecret,
                });

                const user = await this.prisma.user.findUnique({
                    where: { id: payload.sub },
                });

                if (!user || !user.hashedRefreshToken) {
                    throw new ForbiddenException('Access Denied');
                }

                const rtMatches = await bcrypt.compare(dto.refreshToken, user.hashedRefreshToken);

                if (!rtMatches) {
                    throw new ForbiddenException('Access Denied');
                }

                return user;

            });




            return await this.generateTokens(user.id, user.email, user.role);


        } catch (error) {
            this.logger.error('Error refreshing tokens', error);

            if (error instanceof ForbiddenException) {
                throw error;
            }


            throw new InternalServerErrorException('Error refreshing tokens');
        }



    }

    /**
     * This method generates both access and refresh tokens, hashes the refresh token, and stores it in the database.
     * @author Htoo Maung Thait 
     * @since 2026-04-29
     * @param userId 
     * @param email 
     * @param role 
     * @returns Promise<GeneratedTokenDto> generatedTokens
     * 
     */
    public async generateTokens(userId: number, email: string, role: string): Promise<GeneratedTokenDto> {
        const payload = { sub: userId, email, role };



        const accessToken = await this.jwtService.signAsync(payload, {
            secret: this.appConfig.jwtAccessTokenSecret ?? 'defaultAccessTokenSecret',
            expiresIn: (this.appConfig.jwtAccessTokenExpireAfter ?? '15m') as StringValue,
        });



        const accessTokenExpireAfter = this.getExpiresAt(this.appConfig.jwtAccessTokenExpireAfter ?? "15m");

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: this.appConfig.jwtRefreshTokenSecret ?? 'defaultRefreshTokenSecret',
            expiresIn: (this.appConfig.jwtRefreshTokenExpireAfter ?? "7d") as StringValue,
        });

        const refreshTokenExpireAfter = this.getExpiresAt(this.appConfig.jwtRefreshTokenExpireAfter ?? "7d");

        const hashedRt = await bcrypt.hash(refreshToken, 10);

        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken: hashedRt }
        });

        return GeneratedTokenDto.fromData(
            userId,
            email,
            role,
            accessToken,
            accessTokenExpireAfter,
            refreshToken,
            refreshTokenExpireAfter
        );


    }


    private getExpiresAt(expirationString: string): Date {
        const amount = parseInt(expirationString);
        const unit = expirationString.replace(/[0-9]/g, '').toLowerCase();
        const now = new Date();

        switch (unit) {
            case 's': return new Date(now.getTime() + amount * 1000);
            case 'm': return new Date(now.getTime() + amount * 60000);
            case 'h': return new Date(now.getTime() + amount * 3600000);
            case 'd': return new Date(now.getTime() + amount * 86400000);
            default: return new Date(now.getTime() + 3600000); // Default 1 hour
        }
    }


}
