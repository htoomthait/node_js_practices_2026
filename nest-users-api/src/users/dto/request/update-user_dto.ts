import { IsDateString, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdateUserDto {
    @IsString()
    @IsNotEmpty({ message: "Full name is required" })
    fullname?: string;

    @IsEmail()
    @IsNotEmpty({ message: "Email is required and must be a valid email address" })
    email?: string;

    @IsString()
    @IsNotEmpty({ message: "Phone number is required" })
    phoneNumber?: string;

    @IsString()
    address?: string;

    @IsDateString()
    dob?: Date;
}