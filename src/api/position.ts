import HttpClient from "../utility/http-client";

export interface CarPositionInfo {
    lat: number,
    lon: number,
    adr?: string,
    utc?: string,
    spd?: string,
    drc?: string,
    province?: string,
    city?: string,
    country?: string,
    mil?: string,
    vno?: string,
    status?: string,
    offlineState?: boolean,
    offlineTime?: string,
    runDistance?: string,
    remainDistance?: string,
    estimateArriveTime?: string
}

export interface TrajectoryInfo {
    id: number,
    waybillId: number,
    carNumber: string,
    carNumberColor: number,
    longitude: number,
    latitude: number,
    speed: number,
    direction: number,
    hgt: number,
    mlg: number,
    reportAt: number
}

export const getCarPosition = async (carNumber: string, startAreaCode: string, endAreaCode: string) => {
    return HttpClient.post<CarPositionInfo>('/position/now', {carNumber, startAreaCode, endAreaCode})
}

export const getTrajectory = async (waybillId:number, carNumber: string, carNumberColor: number, startTime:number, endTime: number) => {
    return HttpClient.post<TrajectoryInfo[]>('/position/trajectory', {waybillId, carNumber, carNumberColor, startTime, endTime})
}