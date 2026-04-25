import { Body, Controller, Delete, Get, Logger, Param, Post, Put } from '@nestjs/common';
import { CreateUserDto } from './dto/request/create-user-dto';
import { UpdateUserDto } from './dto/request/update-user_dto';
import { BaseController } from 'src/common/controllers/base.controller';
import { ApiResponse } from 'src/common/dto/response/ApiResponse';
import { UserResponseDto } from './dto/response/user.response.dto';

@Controller('users')
export class UsersController extends BaseController {
    protected readonly logger = new Logger(UsersController.name);

    @Get("/")
    getUsers(): ApiResponse<UserResponseDto[] | null> {
        return this.makeResponse(true, [] as UserResponseDto[], 'This will return all users', 200);
    }


    @Get("/:id")
    getUserById(@Param('id') id: string): ApiResponse<UserResponseDto | null> {
        this.logger.debug(`Received request to get user with id: ${id}`);

        return this.makeResponse(true, null, `This will return user with id ${id}`, 200);
    }

    @Get("/get-by-email/:email")
    getUserByEmail(@Param('email') email: string): ApiResponse<UserResponseDto | null> {
        this.logger.debug(`Received request to get user with email: ${email}`);

        return this.makeResponse(true, null, `This will return user with email ${email}`, 200);
    }

    @Post("/")
    createNewUser(@Body() createUserDto: CreateUserDto): ApiResponse<UserResponseDto | null> {
        this.logger.debug(`Received request to create user with data: ${JSON.stringify(createUserDto)}`);
        return this.makeResponse(true, null, 'This will create a new user', 201);
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
