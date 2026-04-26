import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto } from './dto/request/login.dto';
import { RegisterDto } from './dto/request/register.dto';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';
import { StringValue } from "ms";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService
    ) { }

    protected readonly logger = new Logger(AuthService.name);

    async register(dto: RegisterDto) {


        try {

            const existingUser = await this.prisma.user.findUnique({
                where: { email: dto.email }
            });

            if (existingUser) {
                throw new UnauthorizedException('User with this email already exists');
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
            return this.generateTokens(user.id, user.email, user.role);

        } catch (error) {
            if (error instanceof UnauthorizedException) {
                throw error;
            }
            this.logger.error('Error during registration', error);
            throw new UnauthorizedException('Registration failed');
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });

        if (!user || !user.password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const matched = await bcrypt.compare(dto.password, user.password);

        if (!matched) throw new UnauthorizedException();

        return this.generateTokens(user.id, user.email, user.role);
    }

    async generateTokens(userId: number, email: string, role: string) {
        const payload = { sub: userId, email, role };

        const accessToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_ACCESS_SECRET ?? 'default-secrect',
            expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRE ?? "15m") as StringValue,
        });

        const refreshToken = await this.jwtService.signAsync(payload, {
            secret: process.env.JWT_REFRESH_SECRET ?? 'refresh-secret',
            expiresIn: (process.env.JWT_REFRESH_TOKEN_EXPIRE ?? "7d") as StringValue,
        });

        const hashedRt = await bcrypt.hash(refreshToken, 10);

        await this.prisma.user.update({
            where: { id: userId },
            data: { hashedRefreshToken: hashedRt }
        });

        return {
            accessToken,
            refreshToken
        };
    }


}
