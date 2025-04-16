import HttpClient from "../utility/http-client";

export interface WaybillInfo {
    id: number,
    carNumber: string,
    carNumberColor: number,
    driverId: number,
    driverName: string,
    startLocation: string,
    endLocation: string,
    startLocationCode: string,
    endLocationCode: string,
    startAddress: string,
    endAddress: string,
    startTime: number,
    endTime: number,
    status: number,
    cargoType: number,
    cargoWeight: number,
    fileList: string,
    endFileList: string,
    remark: string,
    sender: string,
    senderPhone: string,
    receiver: string,
    receiverPhone: string,
    clientName: string,
    clientId: number,
    orderId: number,
    key?: number,
    waybillNumber: string,
    receiveCompany: string,
    cargoCount: number,
    cargoVolume: number,
    pickUpPhone: string,
    eta: number,
    carModel: string,
}

export interface WaybillCreateForm {
    carNumber: string,
    carNumberColor: number,
    driverId: number,
    driverName: string,
    startLocationCode: string,
    endLocationCode: string,
    startLocation: string,
    endLocation: string,
    startTime: number,
    cargoType: number,
    cargoWeight: number,
    fileList?: string,
    remark?: string,
    startAddress: string,
    endAddress: string,
    sender: string,
    senderPhone: string,
    receiver: string,
    receiverPhone: string,
    clientId: number,
    orderId: number,
    clientName: string,
    waybillNumber: string,
    receiveCompany: string,
    cargoCount: number,
    cargoVolume: number,
    pickUpPhone: string,
    eta: number,
    carModel: string,
}

export interface CityInfo {
    id: number,
    cityName: string,
    cityCode: string,
    parentName: string,
    parentCode: string,
}

export interface UploadConfig {
    version: string,
    policy: string,         // Policy 的 Base64 字符串
    credential: string,
    ossdate: string,
    signature: string,
    token: string,         // STS 临时令牌
    dir: string,
    host: string,
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

export const getCityList = async () => {
    return HttpClient.get<CityInfo[]>('/city/list')
}

export const getWaybillDetail = async (id: number) => {
    return HttpClient.get<WaybillInfo>('/waybill/detail?id=' + id)
}

export const getUploadConfig = async () => {
    return HttpClient.get<UploadConfig>('/waybill/upload')
}

export const finishWaybill = async(id:number, endTime: number, endFileList: string) => {
    return HttpClient.post<undefined>('/waybill/finish', {id, endTime, endFileList})
}
