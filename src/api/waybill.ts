import HttpClient from "../utility/http-client";

export interface WaybillInfo {
    id: number,
    carNumber: string,
    driverId: number,
    driverName: string,
    startLocation: string,
    endLocation: string,
    startLocationCode: string,
    endLocationCode: string,
    startTime: number,
    endTime: number,
    status: string,
    cargoType: string,
    cargoWeight: number,
    GPSDeviceSN: string,
    remark: string,
    key?: number
}

export interface WaybillCreateForm {
    carNumber: string,
    driverId: number,
    startLocationCode: string,
    endLocationCode: string,
    startTime: number,
    cargoType: string,
    cargoWeight: number,
    GPSDeviceSN: string,
    remark: string,
}

export interface PageData<T> {
    count: number,
    rows: T[]
}

export const getWaybillList = async (pageIndex: number, pageSize: number, options: any) => {
    return HttpClient.post<PageData<WaybillInfo>>('/waybill/list', {pageIndex, pageSize, ...options})
}

export const cancelWaybill = async (id:number) => {
    return HttpClient.post<undefined>('/waybill/cancel', {id})
}

export const createWaybill = async (waybill: WaybillCreateForm) => {
    return HttpClient.post<undefined>('/waybill/create', waybill)
}

