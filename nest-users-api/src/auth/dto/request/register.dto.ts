import { IsDateString, IsEmail, IsNotEmpty } from "class-validator";

export class RegisterDto {

    @IsNotEmpty({ message: "Full name is required" })
    fullname!: string;

    @IsEmail({}, { message: "Invalid email format" })
    @IsNotEmpty({ message: "Email is required" })
    email!: string;

    @IsNotEmpty({ message: "Password is required" })
    password!: string;

    @IsNotEmpty({ message: "Phone number is required" })
    phoneNumber!: string;

    @IsDateString()
    dob!: string;
}