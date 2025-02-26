import { encodePassword } from "../utility/helper";
import HttpClient from "../utility/http-client";
import { PageData } from "./waybill";

export interface UserInfo {
    id: number,
    userName: string,
    phone: string,
    role: number,
    remark: string,
    password: string,
    clientId: number,
    clientName: string,
    key?: number
}

export interface UserCreateForm {
    userName: string,
    phone: string,
    role: string,
    remark: string,
    password: string,
    clientId: number,
    clientName: string,
}

export const getUserListMethod = async (pageIndex: number, pageSize: number, options: any) => {
    return HttpClient.post<PageData<UserInfo>>('/user/list', {pageIndex, pageSize, ...options})
}

export const createUser = async (user: UserCreateForm) => { 
    user.password = encodePassword(user.password)
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

export const login = async (phone: string, password: string) => {
    const enctrptedPassword = encodePassword(password)
    return HttpClient.post<UserInfo>('/login', {phone, password: enctrptedPassword})
}

export const logout = async () => {
    return HttpClient.get<undefined>('/logout')
}