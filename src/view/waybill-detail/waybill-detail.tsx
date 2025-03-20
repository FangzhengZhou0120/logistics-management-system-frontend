import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Button, Cascader, DatePicker, Form, Input, message, Modal, Popconfirm, Radio, Select, Space, Spin, Table, Upload, UploadProps } from 'antd';
import { cancelWaybill, createWaybill, getWaybillDetail, getWaybillList, WaybillInfo } from '../../api/waybill';
import { CloseOutlined, PlayCircleOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
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
    const [replayTime, setReplayTime] = useState<[dayjs.Dayjs, dayjs.Dayjs]>();
    const [isReplayMode, setIsReplayMode] = useState(false);
    const [replaySpeed, setReplaySpeed] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const disabledDate = useRef<any>(undefined)

    useEffect(() => {
        if (id) {
            getWaybillDetail(parseInt(id)).then(res => {
                console.log(res.data)
                setWaybill(res.data);
                disabledDate.current = (current: dayjs.Dayjs) => {
                    return current < dayjs(new Date(res.data.startTime)).add(-1, 'day') || current > dayjs(res.data.endTime ? new Date(res.data.endTime) : new Date()).add(1, 'day');
                }
                console.log(disabledDate.current)
            }).catch(err => {
                message.error(err.message);
            })
        }
    }, [])

    useEffect(() => {
        if (waybill) {
            setIsLoading(true);
            if (waybill.status === 2 || waybill.status === 99) {
                getTrajectory(waybill.id, waybill.carNumber, waybill.carNumberColor, waybill.startTime, waybill.endTime).then(res => {
                    setTrajectoryInfo(res.data);
                    setIsLoading(false);
                    setPositionInfo({
                        lon: res.data[res.data.length - 1].longitude,
                        lat: res.data[res.data.length - 1].latitude,
                    })
                }).catch(err => {
                    message.error(err.message);
                })
            } else {
                getCarPosition(waybill.carNumber + '_' + waybill.carNumberColor, waybill.startLocationCode.split(',')[1], waybill.endLocationCode.split(',')[1]).then(res => {
                    setPositionInfo(res.data);
                }).catch(err => {
                    message.error(err.message);
                })
                getTrajectory(waybill.id, waybill.carNumber, waybill.carNumberColor, waybill.startTime, waybill.endTime).then(res => {
                    setTrajectoryInfo(res.data);
                    setIsLoading(false);
                }).catch(err => {
                    message.error(err.message);
                })
            }


        }
    }, [waybill])

    const onClickReplay = () => {
        if (!replayTime) {
            message.error('请选择回放时间');
            return;
        }
        if (isReplayMode && waybill) {
            getCarPosition(waybill.carNumber + '_' + waybill.carNumberColor, waybill.startLocationCode.split(',')[1], waybill.endLocationCode.split(',')[1]).then(res => {
                setPositionInfo(res.data);
            }).catch(err => {
                message.error(err.message);
            })

            getTrajectory(waybill.id, waybill.carNumber, waybill.carNumberColor, waybill.startTime, waybill.endTime).then(res => {
                setTrajectoryInfo(res.data);
                setIsReplayMode(false);
            }).catch(err => {
                message.error(err.message);
            })
        } else if (!isReplayMode && waybill) {
            getTrajectory(waybill.id, waybill.carNumber, waybill.carNumberColor, replayTime?.[0].toDate().getTime() || 0, replayTime?.[1].toDate().getTime() || 0).then(res => {
                setTrajectoryInfo(res.data);
                setIsReplayMode(true);
            }).catch(err => {
                message.error(err.message);
            })
        }
    }
    return (
        <>
            <div className='waybill-detail-tool-bar'>
                <div className='replay'>
                    <DatePicker.RangePicker
                        disabledDate={disabledDate.current}
                        value={replayTime} onChange={(dates) => dates?.[0] && dates?.[1] ? setReplayTime([dates[0], dates[1]]) : undefined} showTime />
                    <Button style={{ marginLeft: '10px' }} type='primary' icon={<PlayCircleOutlined />} onClick={onClickReplay}>{isReplayMode ? "结束回放" : "回放"}</Button>
                </div>
                {isReplayMode && <div>
                    <span style={{ color: 'black' }}>回放速度：</span>
                    <Radio.Group
                        name="radiogroup"
                        value={replaySpeed}
                        onChange={(e) => setReplaySpeed(e.target.value)}
                        options={[
                            { value: 100, label: 'x1' },
                            { value: 20, label: 'x5' },
                            { value: 10, label: 'x10' },
                            { value: 2, label: 'x50' },
                        ]}
                    />
                </div>}
                {/* <div className='waybill-detail-tool-bar-right'><Button type='primary' icon={<UploadOutlined />} onClick={() => setShowWaybillModal(true)}>运单详情</Button></div> */}
            </div>
            {<div className='waybill-detail'>
                {/* <div className='waybill-detail-close'><CloseOutlined style={{cursor: 'pointer'}} onClick={() => setShowWaybillModal(false)}/></div> */}
                <div className='waybill-info'>
                    <div className='waybill-info-item'>
                        <span>运单ID：</span>
                        <span>{waybill?.id}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>运单号：</span>
                        <span>{waybill?.waybillNumber}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>关联订单：</span>
                        <span>{waybill?.orderId}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>客户：</span>
                        <span>{waybill?.clientName}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>车牌号：</span>
                        <span>{waybill?.carNumber}</span>
                    </div>
                    {/* <div className='waybill-info-item'>
                        <span>司机姓名：</span>
                        <span>{waybill?.driverName}</span>
                    </div> */}
                    {/* <div className='waybill-info-item'>
                        <span>起点：</span>
                        <span>{`${waybill?.startLocation} ${waybill?.startAddress}`}</span>
                    </div> */}
                    <div className='waybill-info-item'>
                        <span>终点：</span>
                        <span>{`${waybill?.endLocation} ${waybill?.endAddress}`}</span>
                    </div>
                    {/* <div className='waybill-info-item'>
                        <span>货物类型：</span>
                        <span>{waybill?.cargoType}</span>
                    </div> */}
                    <div className='waybill-info-item'>
                        <span>出发时间：</span>
                        <span>{waybill?.startTime ? dayjs(new Date(waybill?.startTime)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>预计到达时间：</span>
                        <span>{waybill?.eta ? dayjs(new Date(waybill?.eta)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>实际到达时间：</span>
                        <span>{waybill?.endTime ? dayjs(new Date(waybill?.endTime)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>货物重量：</span>
                        <span>{waybill?.cargoWeight} kg</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>货物数量：</span>
                        <span>{waybill?.cargoCount} 箱</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>货物体积：</span>
                        <span>{waybill?.cargoVolume} 方</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>状态：</span>
                        <span>{waybillStatusMap.get(waybill?.status || 0)}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>备注：</span>
                        <span>{waybill?.remark}</span>
                    </div>
                    <div className='waybill-info-item'>
                        <span>车辆当前位置：</span>
                        <span>{positionInfo?.adr}</span>
                    </div>
                </div>
            </div>}
            <Spin spinning={isLoading}>
                {waybill && positionInfo && trajectoryInfo && <AMapComponent waybill={waybill} positionInfo={positionInfo} trajectoryInfo={trajectoryInfo} isReplayMode={isReplayMode} replaySpeed={replaySpeed} />}
            </Spin>
        </>
    )
}