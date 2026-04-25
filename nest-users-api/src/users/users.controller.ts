import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dto/request/create-user-dto';
import { UpdateUserDto } from './dto/request/update-user_dto';
import { BaseController } from 'src/common/controllers/base.controller';
import { ApiResponse } from 'src/common/dto/response/ApiResponse';
import { UserResponseDto } from './dto/response/user.response.dto';
import { User } from '@prisma/client';
import { UsersService } from './users.service';
import { create } from 'domain';

@Controller('users')
export class UsersController extends BaseController {
    protected readonly logger = new Logger(UsersController.name);

    // constructor
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
        this.logger.debug(`Received request to get user with id: ${id}`);

        return this.makeResponse(true, await this.usersService.findById(parseInt(id)), `User with id ${id} retrieved successfully`, 200);
    }

    @Get("/get-by-email/:email")
    async getUserByEmail(@Param('email') email: string): Promise<ApiResponse<UserResponseDto | null>> {
        this.logger.debug(`Received request to get user with email: ${email}`);

        return this.makeResponse(true, null, `This will return user with email ${email}`, 200);
    }

    @Post("/")
    async createNewUser(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<UserResponseDto | null>> {
        // this.logger.debug(`Received request to create user with data: ${JSON.stringify(createUserDto)}`);

        const createdUser = await this.usersService.createUser(createUserDto);

        return this.makeResponse(true,
            createdUser,
            'This will create a new user', 201
        );
    }

    @Put("/:id")
    updateUserById(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto): ApiResponse<UserResponseDto | null> {
        this.logger.debug(`Received request to update user with id: ${id} and data: ${JSON.stringify(updateUserDto)}`);
        return this.makeResponse(true, null, `This will update user with id ${id}`, 200);
    }

    @Delete("/:id")
    deleteUserById(@Param('id') id: string): ApiResponse<UserResponseDto | null> {
        this.logger.debug(`Received request to delete user with id: ${id}`);
        return this.makeResponse(true, null, `This will delete user with id ${id}`, 200);
    }


}
