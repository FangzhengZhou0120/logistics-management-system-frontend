import { Children, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { SearchBar, SearchFilter } from '../../component/search-bar/search-bar'
import { Button, Cascader, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Upload, UploadProps } from 'antd';
import { cancelWaybill, createWaybill, finishWaybill, getCityList, getWaybillDetail, getWaybillList, WaybillInfo } from '../../api/waybill';
import { EditOutlined, EyeOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './waybill-management.scss'
import { cargoTypeMap, carNumberColorMap, waybillStatusMap } from '../../utility/constants';
import { getUserByRole } from '../../api/user';
import { useNavigate } from 'react-router-dom';
import AliyunOSSUpload from '../../component/oss-upload/oss-upload';
import { CityList, CityMap } from '../../utility/city-list';
import { getAllOrders, getOrderDetail, getOrderList } from '../../api/order';
import { get } from 'http';
import { getAllClients } from '../../api/client';
import { useAuth } from '../../context/user-context';

export const WaybillManagement = () => {
    const navigate = useNavigate()
    const { Column } = Table
    const [form] = Form.useForm()
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [data, setData] = useState<WaybillInfo[]>([])
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const searchOption = useRef<any>({})
    //const [cityList, setCityList] = useState<any[]>([])
    const [driverList, setDriverList] = useState<{ label: string; value: string; }[]>([])
    //const cityMap = useRef(CityMap)
    const driverMap = useRef(new Map<string, string>())
    const carNumberColorList = useRef<{ label: string; value: string; }[]>([])
    const orderList = useRef<any[]>([])
    const [clientList, setClientList] = useState<{ label: string; value: string; }[]>([])
    const clientMap = useRef(new Map<string, string>())
    const { user } = useAuth()

    const filters: SearchFilter[] = [
        {
            type: 'input',
            name: 'carNumber',
            label: '车牌号',
            placeholder: '请输入车牌号',
            options: []
        },
        {
            type: 'input',
            name: 'waybillNumber',
            label: '运单号',
            placeholder: '请输入运单号',
            options: []
        },
        // {
        //     type: 'select',
        //     multiple: true,
        //     name: 'driverId',
        //     label: '司机',
        //     placeholder: '请选择司机',
        //     options: driverList
        // },
        // {
        //     type: 'cascader',
        //     name: 'startLocationCode',
        //     label: '始发地',
        //     placeholder: '请选择始发地',
        //     options: CityList
        // },
        {
            type: 'cascader',
            name: 'endLocationCode',
            label: '目的地',
            placeholder: '请选择目的地',
            options: CityList
        },
        // {
        //     type: 'input',
        //     name: 'cargoType',
        //     label: '货物类型',
        //     placeholder: '请输入货物类型',
        //     options: []
        // },
        {
            type: 'select',
            multiple: true,
            name: 'status',
            label: '运单状态',
            placeholder: '请选择运单状态',
            options: [
                { value: '1', label: '进行中' },
                { value: '2', label: '已完成' },
                { value: '-1', label: '异常' },
                { value: '99', label: '已取消' },
            ]
        },
        {
            type: 'dateRange',
            name: 'startTime',
            label: '出发日期',
            placeholder: '请选择出发日期',
            options: []
        },
    ]

    const getWaybillListMethod = () => {
        // searchOption.current.startLocationCode = searchOption.current.startLocationCode?.join(',') || undefined
        searchOption.current.endLocationCode = searchOption.current.endLocationCode?.join(',') || undefined
        return getWaybillList(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
        }).catch(err => {
            message.error("获取运单列表失败" + err.message)
        })
    }

    const onSearch = (values: any) => {
        searchOption.current = values
        setPageIndex(1)
        getWaybillListMethod()
    }

    const onPageChange = (pageIndex: number, pageSize: number) => {
        // searchOption.current.startLocationCode = searchOption.current.startLocationCode?.join(',') || undefined
        searchOption.current.endLocationCode = searchOption.current.endLocationCode?.join(',') || undefined
        getWaybillList(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
            setPageIndex(pageIndex)
            setPageSize(pageSize)
        }).catch(err => {
            message.error('获取运单列表失败' + JSON.stringify(err))
        })
    }

    const onCreate = useCallback(() => {
        if (user?.role !== 1) {
            message.error('权限不足')
            return
        }
        form.resetFields()
        updateClients()
        getUserByRole(2).then(res => {
            setDriverList(res.data.map(it => {
                return {
                    value: it.id.toString(),
                    label: it.userName
                }
            }))
            driverMap.current = new Map(res.data.map(it => [it.id.toString(), it.userName]))
        })
        getAllOrders().then(res => {
            orderList.current = res.data.map(it => {
                return {
                    value: it.id.toString(),
                    label: it.id.toString()
                }
            })
        })
        setOpen(true)
    }, [])

    const confirmAbort = (id: number) => {
        cancelWaybill(id).then(_ => {
            getWaybillListMethod()
            message.success('删除运单成功')
        }).catch(err => {
            message.error('删除运单失败' + JSON.stringify(err))
        })

    };

    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 24,
                offset: 0,
            },
        },
    };

    const onFinish = (values: any) => {
        if (values.id !== undefined) {
            values.endTime = new Date(values.endTime).getTime()
            //values.endFileList = values.endFileList.map((it: any) => it.url).join(',')
            setConfirmLoading(true)
            finishWaybill(values.id, values.endTime, values.endFileList).then(_ => {
                message.success('完成运单成功');
                setOpen(false)
                getWaybillListMethod()
            }).catch(err => {
                message.error('完成运单失败' + JSON.stringify(err))
            }).finally(() => {
                setConfirmLoading(false)
            })
        } else {
            values.startTime = new Date(values.startTime).getTime()
            // values.startLocation = (CityMap.get(values.startLocationCode[0]) || '') + (CityMap.get(values.startLocationCode[1]) || '') + (CityMap.get(values.startLocationCode[2]) || '')
            values.endLocation = (CityMap.get(values.endLocationCode[0]) || '') + (CityMap.get(values.endLocationCode[1]) || '') + (CityMap.get(values.endLocationCode[2]) || '')
            // values.startLocationCode = values.startLocationCode.join(',')
            values.endLocationCode = values.endLocationCode.join(',')
            // values.driverName = driverMap.current.get(values.driverId)
            // values.fileList = values.fileList.map((it: any) => it.url).join(',')
            values.clientName = clientMap.current.get(values.clientId)
            console.log(values)
            setConfirmLoading(true)
            createWaybill(values).then((res) => {
                message.success('创建运单成功');
                setOpen(false)
                getWaybillListMethod()
            }).catch(err => {
                message.error('创建运单失败' + JSON.stringify(err))
            }).finally(() => {
                setConfirmLoading(false)
            })
        }

    };

    const onClickWaybillUpdate = (id: number) => {
        updateClients()
        getWaybillDetail(id).then(res => {
            form.setFieldsValue(res.data)
            form.setFieldsValue({
                startTime: dayjs(new Date(res.data.startTime)),
                endTime: res.data.endTime ? dayjs(new Date(res.data.endTime)) : null,
                // startLocationCode: res.data.startLocationCode.split(','),
                endLocationCode: res.data.endLocationCode.split(','),
                carNumberColor: res.data.carNumberColor.toString(),
                clientId: res.data.clientId.toString(),
                // fileList: res.data.fileList.split(",").map((it: string, index: number) => {
                //     return {
                //         uid: index,
                //         name: it,
                //         status: 'done',
                //         url: it
                //     }
                // }),
                // endFileList: res.data.endFileList.length > 0 ? res.data.endFileList.split(",").map((it: string, index: number) => {
                //     return {
                //         uid: index,
                //         name: it,
                //         status: 'done',
                //         url: it
                //     }
                // }) : []
            })
            setOpen(true)
        }).catch(err => {
            message.error(err.message);
        })
    }

    const onClickWaybillDetail = (id: number) => {
        navigate('/waybill-detail/' + id)
    }

    const onSelectOrder = (value: any) => {
        getOrderDetail(value).then(res => {
            form.setFieldsValue({
                clientId: res.data.clientId.toString(),
                clientName: res.data.clientName,
                sender: res.data.sender,
                senderPhone: res.data.senderPhone,
                receiver: res.data.receiver,
                receiverPhone: res.data.receiverPhone,
                endLocationCode: res.data.endLocationCode.split(','),
                endAddress: res.data.endAddress,
                cargoType: res.data.cargoType,
                receiveCompany: res.data.receiveCompany,
            })
        }).catch(err => {
            message.error(err.message)
        })
    }

    const updateClients = () => {
        getAllClients().then(res => {
            setClientList(res.data.map(it => ({ label: it.clientName, value: it.id.toString() })))
            res.data.forEach(it => clientMap.current.set(it.id.toString(), it.clientName))
        }).catch(err => {
            message.error('获取客户列表失败' + JSON.stringify(err))
        })
    }

    useEffect(() => {
        getWaybillListMethod()
        getUserByRole(2).then(res => {
            setDriverList(res.data.map(it => {
                return {
                    value: it.id.toString(),
                    label: it.userName
                }
            }))
            driverMap.current = new Map(res.data.map(it => [it.id.toString(), it.userName]))
        })
        carNumberColorList.current = Array.from(carNumberColorMap).map(it => {
            return {
                value: it[0].toString(),
                label: it[1]
            }
        })
        getAllOrders().then(res => {
            orderList.current = res.data.map(it => {
                return {
                    value: it.id.toString(),
                    label: it.id.toString()
                }
            })
        })
        updateClients()
    }, [])

    return (
        <Fragment>
            <div className='searchBarWaybill'>
                <SearchBar filters={filters} onSearch={onSearch} createText='新建' onCreate={onCreate} />
            </div>
            <div className='tableWaybill'>
                <Table<WaybillInfo>
                    scroll={{ scrollToFirstRowOnChange: true }}
                    dataSource={data}
                    pagination={{
                        showSizeChanger: true,
                        current: pageIndex,
                        pageSize: pageSize,
                        total: total,
                        onChange: onPageChange
                    }}>
                    <Column title="运单ID" dataIndex="id" key="waybillId" />
                    <Column title="运单号" dataIndex="waybillNumber" key="waybillNumber" />
                    <Column title="车牌号" dataIndex="carNumber" key="carNumber" />
                    <Column title="客户" dataIndex="clientName" key="clientName" />
                    <Column title="运单状态" dataIndex="status" key="status" render={
                        (status: number) => {
                            return <span>{waybillStatusMap.get(status)}</span>
                        }
                    } />
                    {/* <Column title="始发地" dataIndex="startLocation" key="startLocation" /> */}
                    <Column title="目的地" dataIndex="endLocation" key="endLocation" />
                    <Column title="下单人" dataIndex="sender" key="sender" />
                    <Column title="收货人" dataIndex="receiver" key="receiver" />
                    <Column title="提货手机号" dataIndex="pickUpPhone" key="pickUpPhone" />
                    {/* <Column title="货物类型" dataIndex="cargoType" key="cargoType" /> */}
                    <Column
                        title="出发时间"
                        dataIndex="startTime"
                        key="startTime"
                        render={(time) => {
                            return <span>{time ? dayjs(new Date(time)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                        }}
                    />
                    <Column
                        title="预计到达时间"
                        dataIndex="eta"
                        key="eta"
                        render={(time) => {
                            return <span>{time ? dayjs(new Date(time)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                        }}
                    />
                    <Column
                        title="实际到达时间"
                        dataIndex="endTime"
                        key="endTime"
                        render={(time) => {
                            return <span>{time ? dayjs(new Date(time)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                        }}
                    />
                    <Column title="备注" dataIndex="remark" key="remark" />
                    <Column
                        title="操作"
                        key="action"
                        render={(_: any, record: WaybillInfo) => (
                            <Space size="middle">
                                <a onClick={() => onClickWaybillDetail(record.id)}><EyeOutlined />查看</a>
                                <a onClick={() => onClickWaybillUpdate(record.id)}><EditOutlined />更新</a>
                                {record.status !== 99 && <Popconfirm
                                    title="取消运单"
                                    description="是否确定取消运单?"
                                    onConfirm={(e) => confirmAbort(record.id)}
                                    okText="是"
                                    cancelText="否"
                                >
                                    <a><StopOutlined />取消</a>
                                </Popconfirm>}
                                {record.status === 99 && <span style={{ color: 'gray' }}><StopOutlined />取消</span>}
                            </Space>
                        )}
                    />
                </Table>
            </div>
            <Modal
                title={form.getFieldValue('id') ? "运单详情" : "创建运单"}
                open={open}
                confirmLoading={confirmLoading}
                onCancel={() => setOpen(false)}
                footer={null}
                width={1000}
            >
                <Form
                    form={form}
                    onFinish={onFinish}
                    layout='vertical'
                    scrollToFirstError
                >
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                        <div style={{ flex: '1 1 50%', paddingRight: '12px' }}>
                            {
                                form.getFieldValue('id') &&
                                <Form.Item
                                    name="id"
                                    label="运单ID"
                                >
                                    <Input disabled />
                                </Form.Item>
                            }
                            <Form.Item
                                name="orderId"
                                label="关联订单号"
                                rules={[{ required: true, message: '请选择关联订单号!' }]}
                            >
                                <Select placeholder={'请选择关联订单号'} options={orderList.current} allowClear onChange={value => onSelectOrder(value)} />
                            </Form.Item>
                            <Form.Item
                                name="waybillNumber"
                                label="运单号"
                                rules={[{ required: true, message: '请输入运单号!' }]}
                            >
                                <Input  />
                            </Form.Item>
                            <Form.Item
                                name="carNumber"
                                label="车牌号"
                                rules={[{ required: true, message: '请输入车牌号!' }]}
                            >
                                <Input  />
                            </Form.Item>
                            <Form.Item
                                name="carNumberColor"
                                label="车牌颜色"
                                rules={[{ required: true, message: '请选择车牌颜色!' }]}
                            >
                                <Select placeholder={'请选择车牌颜色'} options={carNumberColorList.current} allowClear />
                            </Form.Item>
                            {/* <Form.Item
                        name="driverId"
                        label="司机"
                        rules={[{ required: true, message: '请选择司机!' }]}
                    >
                        <Select disabled={form.getFieldValue('id') !== undefined} placeholder={'请选择司机'} options={driverList} allowClear />
                    </Form.Item> */}
                            {/* <Form.Item
                                name="cargoType"
                                label="货物类型"
                                rules={[{ required: true, message: '请选择货物类型!' }]}
                            >
                                <Input  />
                            </Form.Item> */}
                            <Form.Item
                                name="cargoWeight"
                                label="货物重量"
                                rules={[{ required: true, message: '请输入货物重量!' }]}
                            >
                                <Input  suffix="千克" />
                            </Form.Item>
                            <Form.Item
                                name="cargoCount"
                                label="货物数量"
                                rules={[{ required: true, message: '请输入货物数量!' }]}
                            >
                                <Input suffix="箱" />
                            </Form.Item>
                            <Form.Item
                                name="cargoVolume"
                                label="货物体积"
                                rules={[{ required: true, message: '请输入货物体积!' }]}
                            >
                                <Input suffix="方" />
                            </Form.Item>
                            {/* <Form.Item
                                name="startLocationCode"
                                label="始发地"
                                rules={[{ required: true, message: '请选择始发地!' }]}
                            >
                                <Cascader  placeholder={'请选择始发地'} options={CityList} allowClear />
                            </Form.Item>
                            <Form.Item
                                name="startAddress"
                                label="始发地详细地址"
                                rules={[{ required: true, message: '请输入始发地详细地址!' }]}
                            >
                                <Input  />
                            </Form.Item> */}
                        
                            
                            <Form.Item
                                name="endLocationCode"
                                label="目的地"
                                rules={[{ required: true, message: '请选择目的地!' }]}
                            >
                                <Cascader  placeholder={'请选择目的地'} options={CityList} allowClear />
                            </Form.Item>
                            <Form.Item
                                name="endAddress"
                                label="目的地详细地址"
                                rules={[{ required: true, message: '请输入目的地详细地址!' }]}
                            >
                                <Input  />
                            </Form.Item>

                            </div>

                        <div style={{ flex: '1 1 50%', paddingLeft: '12px' }}>

                            <Form.Item
                                label="发货时间"
                                name="startTime"
                                rules={[{ required: true, message: '请选择出发时间!' }]}
                            >
                                <DatePicker  showTime />
                            </Form.Item>
                            <Form.Item
                                label="预计到达时间"
                                name="eta"
                                rules={[{ required: true, message: '请选择预计到达时间!' }]}
                            >
                                <DatePicker  showTime />
                            </Form.Item>
                            {
                                form.getFieldValue('id') && <Form.Item
                                    label="到达时间"
                                    name="endTime"
                                    rules={[{ required: true, message: '请选择到达时间!' }]}
                                >
                                    <DatePicker  showTime />
                                </Form.Item>
                            }
                            <Form.Item
                                name="clientId"
                                label="客户公司名称"
                                rules={[{ required: true, message: '请选择客户公司名称!' }]}
                            >
                                <Select  placeholder={'请选择客户公司名称'} options={clientList} allowClear />
                            </Form.Item>
                            <Form.Item
                                name="sender"
                                label="下单人"
                                rules={[{ required: true, message: '请输入下单人姓名!' }]}
                            >
                                <Input  />
                            </Form.Item>
                            <Form.Item
                                name="senderPhone"
                                label="下单人手机号"
                                rules={[{ required: true, message: '请输入下单人手机号!' }]}
                            >
                                <Input  />
                            </Form.Item>
                            <Form.Item
                                name="receiveCompany"
                                label="收货公司"
                                rules={[{ required: true, message: '请输入收货公司!' }]}
                            >
                                <Input  />
                            </Form.Item>
                            <Form.Item
                                name="receiver"
                                label="收货人"
                                rules={[{ required: true, message: '请输入收货人姓名!' }]}
                            >
                                <Input  />
                            </Form.Item>
                            <Form.Item
                                name="receiverPhone"
                                label="收货人手机号"
                                rules={[{ required: true, message: '请输入收货人手机号!' }]}
                            >
                                <Input  />
                            </Form.Item>
                            <Form.Item
                                name="pickUpPhone"
                                label="提货手机号"
                                rules={[{ required: true, message: '请输入提货手机号!' }]}
                            >
                                <Input  />
                            </Form.Item>
                            <Form.Item
                                name="remark"
                                label="备注"
                            // rules={[{ required: true, message: 'Please input the description' }]}
                            >
                                <Input.TextArea showCount maxLength={200} />
                            </Form.Item>
                        </div>
                    </div>



                    {/* <Form.Item
                        label="出发前检查"
                        name="fileList"
                        rules={[{ required: true, message: '请上传照片!' }]}
                    >
                        <AliyunOSSUpload disabled={form.getFieldValue('id') !== undefined} key={"file_list"} />
                    </Form.Item>
                    {
                        form.getFieldValue('id') && <Form.Item
                            label="到达后检查"
                            name="endFileList"
                            rules={[{ required: true, message: '请上传照片!' }]}
                        >
                            <AliyunOSSUpload disabled={form.getFieldValue('status') != 1} key={"end_file_list"} />
                        </Form.Item>
                    } */}
                    <Form.Item style={{ textAlign: 'center' }}>
                        {(form.getFieldValue('id') === undefined || form.getFieldValue('status') == 1) && <Button type="primary" htmlType="submit">
                            {form.getFieldValue('id') ? "确认送达" : "提交"}
                        </Button>}
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}