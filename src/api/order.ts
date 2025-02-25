import HttpClient from "../utility/http-client";
import { PageData } from "./waybill";

export interface OrderInfo {
    id: number,
    status: number,
    sender: string,
    senderPhone: string,
    receiver: string,
    receiverPhone: string,
    endLocation: string,
    endLocationCode: string,
    endAddress: string,
    startTime: number,
    endTime: number,
    cargoType: number,
    cargoCount: string,
    remark: string,
    clientId: number,
    clientName: string,
    key?: number
}

export interface OrderCreateForm {
    sender: string,
    senderPhone: string,
    receiver: string,
    receiverPhone: string,
    endLocation: string,
    endLocationCode: string,
    endAddress: string,
    startTime: number,
    cargoType: number,
    cargoCount: string,
    remark: string,
    clientId: number,
    clientName: string,
}

export const getOrderList = async (pageIndex: number, pageSize: number, options: any) => {
    return HttpClient.post<PageData<OrderInfo>>('/order/list', {pageIndex, pageSize, ...options})
}

export const createOrder = async (data: OrderCreateForm) => {
    return HttpClient.post<number>('/order/create', data)
}

export const updateOrder = async (data: OrderInfo) => {
    return HttpClient.post<undefined>('/order/update', data)
}

export const deleteOrder = async (id: number) => {
    return HttpClient.post<undefined>('/order/delete', {id})
}