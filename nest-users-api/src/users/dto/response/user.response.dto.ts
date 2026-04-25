

export class UserResponseDto {
    id: string;
    fullname: string;
    email: string;
    phoneNumber: string;
    address: string;
    dob: Date;

    constructor(id: string, fullname: string, email: string, phoneNumber: string, address: string, dob: Date) {
        this.id = id;
        this.fullname = fullname;
        this.email = email;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.dob = dob;
    }

    static fromEntity(user: any): UserResponseDto {
        return new UserResponseDto(
            user.id,
            user.fullname,
            user.email,
            user.phoneNumber,
            user.address,
            user.dob
        );
    }
}