import { Injectable, InternalServerErrorException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/request/create-user-dto';
import { UserResponseDto } from './dto/response/user.response.dto';
import { UpdateUserDto } from './dto/request/update-user_dto';
import { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class UsersService {

    protected readonly logger = new Logger(UsersService.name);

    constructor(
        private readonly prisma: PrismaService,
        private readonly authService: AuthService
    ) { }

    /**
     * Retrieves all users from the database.
     * @returns A promise resolving to an array of User objects.
     */
    async findAll() {
        let users = await this.prisma.user.findMany({
            orderBy: { id: 'desc' },
        });
        return users.map(UserResponseDto.fromEntity);
    }

    /**
     * Create a new user with duplicate email check
     * @param userData The data for the new user
     * @returns A promise resolving to the created User object
     */
    async createUser(userData: CreateUserDto): Promise<UserResponseDto> {


        try {
            // Check if a user with the same email already exists
            const existingUser = await this.prisma.user.findUnique({
                where: { email: userData.email }
            });

            if (existingUser) {
                throw new ConflictException('User with this email already exists');
            }

            const hashedPassword = await bcrypt.hash(userData.password, 10);

            // Create the new user
            const createdUser = await this.prisma.user.create({
                data: {
                    ...userData,
                    password: hashedPassword,
                    dob: userData.dob ? new Date(userData.dob) : new Date("1910-01-01"),
                }
            });

            // generate token for the new user and update token to database
            await this.authService.generateTokens(createdUser.id, createdUser.email, createdUser.role);

            return UserResponseDto.fromEntity(createdUser);
        } catch (error) {
            this.logger.error('Error creating user', error);
            throw new InternalServerErrorException('Failed to create user');
        }
    }

    /**
     * Get user by ID or throw NotFoundException
     */
    async findById(id: number): Promise<UserResponseDto> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                // This is the standard NestJS "Entity not found" approach
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            return UserResponseDto.fromEntity(user);
        } catch (error) {
            // If it's already a NotFoundException, just re-throw it
            if (error instanceof NotFoundException) {
                throw error;
            }
            // Handle unexpected DB errors
            throw new InternalServerErrorException('Error retrieving user');
        }
    }

    async findByEmail(email: string): Promise<UserResponseDto> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email },
            });

            if (!user) {
                throw new NotFoundException(`User with email ${email} not found`);
            }

            return UserResponseDto.fromEntity(user);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error retrieving user by email');
        }

    }

    /**
    * Update user by ID 
    */
    async updateUser(id: number, updateData: UpdateUserDto): Promise<UserResponseDto> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                // This is the standard NestJS "Entity not found" approach
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            // 1. Better check: Ensure it's a string and not empty
            if (updateData.password && updateData.password.trim() !== "" && updateData.password !== undefined) {
                updateData.password = await bcrypt.hash(updateData.password, 10);
            } else {
                // 2. Delete the password from updateData if we aren't changing it
                // This prevents overwriting the DB with an empty string or undefined
                (updateData as any).password = "";
            }

            // Update the user with the new data
            const updatedUser = await this.prisma.user.update({
                where: { id },
                data: {
                    ...updateData,
                    dob: updateData.dob ? new Date(updateData.dob) : new Date("1910-01-01"),
                    password: updateData.password != "" ? updateData.password : user.password,
                }
            });

            // generate token for the new user and update token to database
            await this.authService.generateTokens(updatedUser.id, updatedUser.email, updatedUser.role);

            return UserResponseDto.fromEntity(updatedUser);
        } catch (error) {
            this.logger.error('Error updating user', error);
            if (error instanceof NotFoundException) {

                throw error;
            }

            throw new InternalServerErrorException('Error updating user');
        }
    }

    /**
     * Delete user by ID (to be implemented)
     */
    async deleteUser(id: number): Promise<UserResponseDto> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
            });

            if (!user) {
                // This is the standard NestJS "Entity not found" approach
                throw new NotFoundException(`User with ID ${id} not found`);
            }

            await this.prisma.user.delete({
                where: { id },
            });

            return UserResponseDto.fromEntity(user);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw error;
            }
            throw new InternalServerErrorException('Error deleting user');
        }
    }

}
