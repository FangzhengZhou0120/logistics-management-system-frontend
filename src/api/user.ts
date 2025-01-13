import { encodePassword } from "../utility/helper";
import HttpClient from "../utility/http-client";
import { PageData } from "./waybill";

export interface UserInfo {
    id: number,
    userName: string,
    phone: string,
    role: string,
    remark: string,
    key?: number
}

export interface UserCreateForm {
    userName: string,
    phone: string,
    role: string,
    remark: string,
}

export const getUserListMethod = async (pageIndex: number, pageSize: number, options: any) => {
    return HttpClient.post<PageData<UserInfo>>('/user/list', {pageIndex, pageSize, ...options})
}

export const createUser = async (user: UserCreateForm) => { 
    return HttpClient.post<undefined>('/user/create', user)
}

export const updateUser = async (user: UserInfo) => {
    return HttpClient.post<undefined>('/user/update', user)
}

export const deleteUser = async (id: number) => {
    return HttpClient.post<undefined>('/user/delete', {id})
}

export const getUserByRole = async (role: number) => {
    return HttpClient.get<UserInfo[]>('/user/role?role=' + role)
}

export const login = async (userName: string, password: string) => {
    const enctrptedPassword = encodePassword(password)
    return HttpClient.post<UserInfo>('/user/login', {userName, password: enctrptedPassword})
}