import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/request/register.dto';
import { LoginDto } from './dto/request/login.dto';
import { BaseController } from 'src/common/controllers/base.controller';
import { RefreshTokenDto } from './dto/request/refersh.token.dto';
import { ApiResponse } from 'src/common/dto/response/ApiResponse';
import { GeneratedTokenDto } from './dto/response/generated-token.dto';

@Controller('auth')
export class AuthController extends BaseController {

    constructor(private authService: AuthService) {
        super();
    }

    @Post('register')
    async register(@Body() dto: RegisterDto): Promise<ApiResponse<GeneratedTokenDto | null>> {


        return this.makeResponse(
            true,
            await this.authService.register(dto),
            'User registered successfully',
            201
        );



    }

    @Post('login')
    async login(@Body() dto: LoginDto): Promise<ApiResponse<GeneratedTokenDto | null>> {


        return this.makeResponse(
            true,
            await this.authService.login(dto),
            'User logged in successfully',
            200
        );
    }

    @Post('refresh')
    async refreshTokens(@Body() dto: RefreshTokenDto): Promise<ApiResponse<GeneratedTokenDto | null>> {

        return this.makeResponse(
            true,
            await this.authService.refreshTokens(dto),
            'Tokens refreshed successfully',
            200
        );
    }
}
