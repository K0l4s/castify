export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    email: string;
    password: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: Date;
    phoneNumber: string;
    avatar: string;
    banner:string;
}
