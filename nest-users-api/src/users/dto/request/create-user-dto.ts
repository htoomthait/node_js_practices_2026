import { IsDateString, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateUserDto {


    @IsNotEmpty({ message: "Full name is required" })
    @IsString()
    fullname!: string;

    @IsNotEmpty({ message: "Email is required and must be a valid email address" })
    @IsEmail()
    email!: string;


    @IsNotEmpty({ message: "Phone number is required" })
    @IsString()
    phoneNumber!: string;

    @IsString()
    address: string = "";

    @IsDateString()
    dob?: string;


    @IsNotEmpty({ message: "Password is required" })
    @IsString()
    password!: string;


}