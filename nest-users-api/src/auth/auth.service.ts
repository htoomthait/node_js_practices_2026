import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/request/login.dto';
import { RegisterDto } from './dto/request/register.dto';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import ms, { StringValue } from "ms";
import { RefreshTokenDto } from './dto/request/refersh.token.dto';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    protected readonly logger = new Logger(AuthService.name);

    public async register(dto: RegisterDto) {


        try {

            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email }
            });

            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            const hashedPassword = await bcrypt.hash(dto.password, 10);

            const user = await this.prisma.user.create({
                data: {
                    fullname: dto.fullname,
                    email: dto.email,
                    password: hashedPassword,
                    phoneNumber: dto.phoneNumber,
                    dob: new Date(dto.dob),
                    role: 'USER'
                }
            });
            return await this.generateTokens(user.id, user.email, user.role);

        } catch (error) {
            this.logger.error('Error during registration', error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException('Registration failed');
        }
    }

    public async login(dto: LoginDto) {


        try {
            const user = await this.prisma.user.findUnique({
                where: { email: dto.email }
            });

            if (!user || !user.password) {
                throw new UnauthorizedException('Invalid credentials');
            }

            const matched = await bcrypt.compare(dto.password, user.password);

            if (!matched) throw new UnauthorizedException('Inavalid credentials');

            return await this.generateTokens(user.id, user.email, user.role);
        } catch (error) {
            this.logger.error('Error during login', error);
            if (error instanceof UnauthorizedException) {
                throw error;
            }

            throw new UnauthorizedException('Login operation failed');
        }
    }

    public async refreshTokens(dto: RefreshTokenDto) {

        try {
            const user = await this.prisma.user.findUnique({
                where: { id: dto.userId },
            });

            if (!user || !user.hashedRefreshToken) {
                throw new ForbiddenException('Access Denied');
            }

            const rtMatches = await bcrypt.compare(dto.refreshToken, user.hashedRefreshToken);

            if (!rtMatches) {
                throw new ForbiddenException('Access Denied');
            }


            return await this.generateTokens(user.id, user.email, user.role);


        } catch (error) {
            this.logger.error('Error refreshing tokens', error);

            if (error instanceof ForbiddenException) {
                throw error;
            }


            throw new InternalServerErrorException('Error refreshing tokens');
        }



    }

    public async generateTokens(userId: number, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET ?? 'default-secrect',
            expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRE ?? "15m") as StringValue,
        });



        const accessTokenExpireAfter = this.getExpiresAt(process.env.JWT_ACCESS_TOKEN_EXPIRE ?? "15m");

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
            expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRE ?? "7d") as StringValue,
        });

        const refreshTokenExpireAfter = this.getExpiresAt(process.env.JWT_REFRESH_TOKEN_EXPIRE ?? "7d");

        const hashedRt = await bcrypt.hash(refreshToken, 10);

        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken: hashedRt }
        });

        return {
            userId,
            email,
            role,
            accessToken,
            accessTokenExpireAfter,
            refreshToken,
            refreshTokenExpireAfter
        };
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
