import { Injectable, InternalServerErrorException, ConflictException, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/request/create-user-dto';
import { UserResponseDto } from './dto/response/user.response.dto';

@Injectable()
export class UsersService {

    protected readonly logger = new Logger(UsersService.name);

    constructor(private readonly prisma: PrismaService) { }

    /**
     * Retrieves all users from the database.
     * @returns A promise resolving to an array of User objects.
     */
    async findAll() {
        let users = await this.prisma.user.findMany();
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

            this.logger.debug(`Creating user with data: ${JSON.stringify(userData)}`);

            // Create the new user
            const createdUser = await this.prisma.user.create({
                data: {
                    ...userData,
                    dob: userData.dob ? new Date(userData.dob) : new Date("1910-01-01"),
                }
            });
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

}
