import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { SearchBar, SearchFilter } from '../../component/search-bar/search-bar'
import { Button, Cascader, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Upload, UploadProps } from 'antd';
import { cancelWaybill, createWaybill, getWaybillDetail, getWaybillList, WaybillInfo } from '../../api/waybill';
import { CloseOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './waybill-detail.scss'
import { cargoTypeMap, waybillStatusMap } from '../../utility/constants';
import { AMapComponent } from '../../component/amap/amap';
import { useParams } from 'react-router-dom';
import { CarPositionInfo, getCarPosition, getTrajectory, TrajectoryInfo } from '../../api/position';

export const WaybillDetail = () => {
    const params = useParams();
    const { id } = params;
    const [waybill, setWaybill] = useState<WaybillInfo>();
    const [positionInfo, setPositionInfo] = useState<CarPositionInfo>();
    const [showWaybillModal, setShowWaybillModal] = useState(false);
    const [trajectoryInfo, setTrajectoryInfo] = useState<TrajectoryInfo[]>([]);

    useEffect(() => {
        if (id) {
            getWaybillDetail(parseInt(id)).then(res => {
                setWaybill(res.data);
            }).catch(err => {
                message.error(err.message);
            })
        }
    },[])

    useEffect(() => {
        if (waybill) {
            getCarPosition(waybill.carNumber + '_' + waybill.carNumberColor, waybill.startLocationCode.split(',')[1], waybill.endLocationCode.split(',')[1]).then(res => {
                setPositionInfo(res.data);
            }).catch(err => {
                message.error(err.message);
            })

            getTrajectory(waybill.id, waybill.carNumber, waybill.carNumberColor, waybill.startTime, waybill.endTime).then(res => {
                setTrajectoryInfo(res.data);
            }).catch(err => {
                message.error(err.message);
            })
        }
    },[waybill])
    return (
        <>
            <div className='waybill-detail-tool-bar'>
                <div className='waybill-detail-tool-bar-right'><Button type='primary' icon={<UploadOutlined />} onClick={() => setShowWaybillModal(true)}>运单详情</Button></div>
            </div>
            {showWaybillModal && <div className='waybill-detail'>
                <div className='waybill-detail-close'><CloseOutlined style={{cursor: 'pointer'}} onClick={() => setShowWaybillModal(false)}/></div>
                <div className='waybill-info'>
                    <div className='waybill-info-item'>
                        <span>运单编号：</span>
                        <span>{waybill?.id}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>车牌号：</span>
                        <span>{waybill?.carNumber}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>司机姓名：</span>
                        <span>{waybill?.driverName}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>起点：</span>
                        <span>{waybill?.startLocation}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>终点：</span>
                        <span>{waybill?.endLocation}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>货物类型：</span>
                        <span>{cargoTypeMap.get( waybill?.cargoType || 99)}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>货物重量：</span>
                        <span>{waybill?.cargoWeight}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>状态：</span>
                        <span>{waybillStatusMap.get(waybill?.status || 0)}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>备注：</span>
                        <span>{waybill?.remark}</span>
                    </div>
                </div>
            </div>}
            {waybill && positionInfo && trajectoryInfo && <AMapComponent waybill={waybill} positionInfo={positionInfo} trajectoryInfo={trajectoryInfo}/>}
        </>
    )
}