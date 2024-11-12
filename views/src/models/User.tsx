import { Role } from '../constants/Role'

export interface User {
    id: string,
    firstName: string,
    middleName: string,
    lastName: string,
    avatarUrl: string,
    coverUrl: string,
    email: string,
    password: string,
    birthday: Date,
    address: string,
    phone: string,
    code: string,
    createDay: Date,
    isActive: boolean,
    isLock: boolean,
    nickName: string,
    role: Role
    [key: string]: any;
}
export interface userCard {
    id: number;
    email: string;
    firstName: string;
    middleName: string;
    lastName: string;
    avatarUrl: string;
    coverUrl: string;
    // [key: string]: any;
}

export interface userLogin {
    email: string;
    password: string;
}

export interface userRegister {
    // firstName: string,
    // middleName: string,
    // lastName: string,
    // email: string,
    // repeatEmail: string,
    // password: string,
    // repeatPass: string,
    // birthday: Date,
    // address: string,
    // phone: string,
    // nickName: string,
    lastName: string,
    middleName:string,
    firstName:string,
    email:string,
    repeatEmail:string,
    username:string,
    password:string,
    confirmPassword:string,
    birthday:Date,
    address:string,
    phone:string
}
export interface userConfirm {
    email: string;
    code: string;
}

export interface userUpdate {
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
