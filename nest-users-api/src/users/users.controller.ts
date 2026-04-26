import { Body, Controller, Delete, Get, Logger, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CreateUserDto } from './dto/request/create-user-dto';
import { UpdateUserDto } from './dto/request/update-user_dto';
import { BaseController } from 'src/common/controllers/base.controller';
import { ApiResponse } from 'src/common/dto/response/ApiResponse';
import { UserResponseDto } from './dto/response/user.response.dto';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { create } from 'domain';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard())
@Controller('users')
export class UsersController extends BaseController {
    protected readonly logger = new Logger(UsersController.name);


    constructor(private readonly usersService: UsersService) {
        super();
    }




    @Get("/")
    async getUsers(): Promise<ApiResponse<UserResponseDto[] | null>> {
        return this.makeResponse(
            true,
            await this.usersService.findAll(),
            'All users retrieved successfully',
            200
        );
    }


    @Get("/:id")
    async getUserById(@Param('id') id: string): Promise<ApiResponse<UserResponseDto | null>> {


        return this.makeResponse(
            true,
            await this.usersService.findById(parseInt(id)),
            `User with id ${id} retrieved successfully`,
            200
        );
    }

    @Get("/get-by-email/:email")
    async getUserByEmail(@Param('email') email: string): Promise<ApiResponse<UserResponseDto | null>> {

        return this.makeResponse(
            true,
            await this.usersService.findByEmail(email),
            `User with email ${email} retrieved successfully`,
            200
        );
    }

    @Post("/")
    async createNewUser(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<UserResponseDto | null>> {




        return this.makeResponse(
            true,
            await this.usersService.createUser(createUserDto),
            'The user has been created successfully',
            201
        );
    }

    @Put("/:id")
    async updateUserById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponse<UserResponseDto | null>> {


        return this.makeResponse(
            true,
            await this.usersService.updateUser(parseInt(id), updateUserDto),
            `The user with id ${id} has been updated successfully`,
            200
        );
    }

    @Delete("/:id")
    async deleteUserById(@Param('id') id: string): Promise<ApiResponse<UserResponseDto | null>> {

        return this.makeResponse(
            true,
            await this.usersService.deleteUser(parseInt(id)),
            `The user with id ${id} has been deleted successfully`,
            200
        );
    }


}
