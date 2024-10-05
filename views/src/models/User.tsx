import { Role } from '../constants/Role'

export interface User {
    id: number;
    email: string;
    role: Role;
    avatar: string;
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth:Date;
    [key: string]: any;
}