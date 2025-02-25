import HttpClient from "../utility/http-client";
import { PageData } from "./waybill";

export interface ClientInfo {
    id: number,
    clientName: string,
    address: string,
    remark: string,
    key?: number
}

export interface ClientCreateForm {
    clientName: string,
    address: string,
    remark: string
}

export const getClientList = async (pageIndex: number, pageSize: number, options: any) => {
    return HttpClient.post<PageData<ClientInfo>>('/client/list', {pageIndex, pageSize, ...options})
}

export const createClient = async (client: ClientCreateForm) => {
    return HttpClient.post<number>('/client/create', client)
}

export const updateClient = async (client: ClientInfo) => {
    return HttpClient.post<undefined>('/client/update', client)
}