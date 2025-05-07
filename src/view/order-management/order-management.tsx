import { Children, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { SearchBar, SearchFilter } from '../../component/search-bar/search-bar'
import { Button, Cascader, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Upload, UploadProps } from 'antd';
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusCircleOutlined, PlusOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './order-management.scss'
import { cargoTypeMap, carNumberColorMap, getCargoLocationList, orderStatusMap, waybillStatusMap } from '../../utility/constants';
import { getUserByRole } from '../../api/user';
import { useNavigate, useLocation } from 'react-router-dom';
import { CityList, CityMap } from '../../utility/city-list';
import { createOrder, deleteOrder, finishOrderMethod, getOrderList, OrderInfo, updateOrder } from '../../api/order';
import { useAuth } from '../../context/user-context';
import { getAllClients, updateClient } from '../../api/client';

export const OrderManagement = () => {
    const navigate = useNavigate()
    const { Column } = Table
    const [form] = Form.useForm()
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [data, setData] = useState<OrderInfo[]>([])
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const searchOption = useRef<any>({})
    const { user } = useAuth()
    // const [cityList, setCityList] = useState<any[]>([])
    // const [driverList, setDriverList] = useState<{ label: string; value: string; }[]>([])
    // const cityMap = useRef(CityMap)
    const driverMap = useRef(new Map<string, string>())
    const carNumberColorList = useRef<{ label: string; value: string; }[]>([])
    const [clientList, setClientList] = useState<{ label: string; value: string; }[]>([])
    const [customItems, setCustomItems] = useState<Array<{key: string, value: string}>>([]);
    const clientMap = useRef(new Map<string, string>())
    const location = useLocation();

    const filters: SearchFilter[] = [
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
            label: '订单状态',
            placeholder: '请选择订单状态',
            options: [
                { value: '0', label: '已下单' },
                { value: '1', label: '已派车' },
                { value: '2', label: '已送达' },
                { value: '-1', label: '异常' },
                { value: '99', label: '已取消' },
            ]
        },
        // {
        //     type: 'select',
        //     multiple: true,
        //     name: 'clientId',
        //     label: '客户公司',
        //     placeholder: '请选择客户公司',
        //     options: clientList
        // },
        {
            type: 'input',
            name: 'receiver',
            label: '收货联系人',
            placeholder: '请输入收货人',
            options: []
        },
        // {
        //     type: 'dateRange',
        //     name: 'pickUpDate',
        //     label: '提货日期',
        //     placeholder: '请选择提货日期',
        //     options: []
        // }
    ]

    const getOrderListMethod = () => {
        return getOrderList(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
        }).catch(err => {
            message.error("获取订单列表失败" + err.message)
        })
    }

    const onSearch = (values: any) => {
        searchOption.current = values
        setPageIndex(1)
        getOrderListMethod()
    }

    const onPageChange = (pageIndex: number, pageSize: number) => {
        getOrderList(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
            setPageIndex(pageIndex)
            setPageSize(pageSize)
        }).catch(err => {
            message.error('获取订单列表失败' + JSON.stringify(err))
        })
    }

    const onCreate = useCallback(() => {
        form.resetFields()
        updateClients()
        setCustomItems([])
        form.setFieldsValue({
            sender: user?.userName,
            senderPhone: user?.phone,
            clientId: user?.role === 1 ? undefined : user?.clientId.toString(),
        })
        setOpen(true)
    }, [])

    const confirmAbort = (id: number) => {
        deleteOrder(id).then(_ => {
            getOrderListMethod()
            message.success('删除订单成功')
        }).catch(err => {
            message.error('删除订单失败' + JSON.stringify(err))
        })

    };

    const finishOrder = (id: number) => {
        finishOrderMethod(id).then(_ => {
            setOpen(false)
            getOrderListMethod()
            message.success('完成订单成功')
        }).catch(err => {
            message.error('完成订单失败' + JSON.stringify(err))
        })
    }

    const tailFormItemLayout = {
        wrapperCol: {
            xs: {
                span: 24,
                offset: 0,
            },
            sm: {
                span: 16,
                offset: 8,
            },
        },
    };

    const onFinish = (values: any) => {
        //values.startTime = new Date(values.startTime).getTime()
        //values.startLocation = (CityMap.get(values.startLocationCode[0]) || '') + (CityMap.get(values.startLocationCode[1]) || '') + (CityMap.get(values.startLocationCode[2]) || '')
        // values.endLocation = (CityMap.get(values.endLocationCode[0]) || '') + (CityMap.get(values.endLocationCode[1]) || '') + (CityMap.get(values.endLocationCode[2]) || '')
        // values.startLocationCode = values.startLocationCode.join(',')
        // values.endLocationCode = values.endLocationCode.join(',')
        values.clientId = Number(values.clientId)
        values.clientName = clientMap.current.get(values.clientId.toString())
        // values.driverName = driverMap.current.get(values.driverId)
        // values.fileList = values.fileList.map((it: any) => it.url).join(',')
        customItems.push({ key: 'getCargoLocation', value: values.getCargoLocation })
        if(customItems.length > 0) {
            values.extra = JSON.stringify(customItems)
        }
        if (values.id) {
            values.id = parseInt(values.id)
            updateOrder(values).then((res) => {
                message.success('更新订单成功');
                setOpen(false)
                getOrderListMethod()
            }).catch(err => {
                message.error('更新订单失败' + JSON.stringify(err))
            }).finally(() => {
                setConfirmLoading(false)
            })
            return
        }
        setConfirmLoading(true)
        createOrder(values).then((res) => {
            message.success('创建订单成功');
            setOpen(false)
            getOrderListMethod()
        }).catch(err => {
            message.error('创建订单失败' + JSON.stringify(err))
        }).finally(() => {
            setConfirmLoading(false)
        })

    };

    const onClickOrderDetail = (record: OrderInfo) => {
        updateClients()
        form.setFieldsValue(record)
        form.setFieldsValue({
            // endLocationCode: record.endLocationCode.split(','),
            clientId: record.clientId.toString(),
            pickUpDate: record.pickUpDate ? dayjs(new Date(record.pickUpDate)) : undefined,
            eta: record.eta ? dayjs(new Date(record.eta)) : undefined,
            cargoType: record.cargoType,
        })
        if (record.extra) {
            try {
                const items = JSON.parse(record.extra);
                if (Array.isArray(items) && items.length > 0) {
                    items.forEach((item: any, index) => {
                        if (item.key === 'getCargoLocation') {
                            form.setFieldsValue({ getCargoLocation: item.value });
                            items.splice(index, 1);
                        }
                    });
                }
                setCustomItems(Array.isArray(items) ? items : []);
            } catch (e) {
                setCustomItems([]);
                console.error("Error parsing custom items", e);
            }
        } else {
            setCustomItems([]);
        }
        setOpen(true)
    }
    const updateClients = () => {
        getAllClients().then(res => {
            setClientList(res.data.map(it => ({ label: it.clientName, value: it.id.toString() })))
            res.data.forEach(it => clientMap.current.set(it.id.toString(), it.clientName))
        })
    }

    useEffect(() => {
        getOrderListMethod()
        updateClients()
    }, [])

    useEffect(() => {
        if (location.pathname === '/order-list') {
            getOrderListMethod();
        }
    }, [location.pathname]);

    const addCustomItem = () => {
        setCustomItems([...customItems, { key: '', value: '' }]);
    };

    const removeCustomItem = (index: number) => {
        const updatedItems = [...customItems];
        updatedItems.splice(index, 1);
        setCustomItems(updatedItems);
    };

    const updateCustomItem = (index: number, field: 'key' | 'value', value: string) => {
        const updatedItems = [...customItems];
        updatedItems[index] = { ...updatedItems[index], [field]: value };
        setCustomItems(updatedItems);
    };

    return (
        <Fragment>
            <div className='searchBarWaybill'>
                <SearchBar filters={filters} onSearch={onSearch} createText='新建' onCreate={onCreate} />
            </div>
            <div className='tableWaybill'>
                <Table<OrderInfo>
                    scroll={{ scrollToFirstRowOnChange: true }}
                    dataSource={data}
                    pagination={{
                        showSizeChanger: true,
                        current: pageIndex,
                        pageSize: pageSize,
                        total: total,
                        onChange: onPageChange
                    }}>
                    <Column title="订单ID" dataIndex="id" key="waybillId" />
                    <Column title="订单状态" dataIndex="status" key="status" render={
                        (status: number) => {
                            return <span>{orderStatusMap.get(status)}</span>
                        }
                    } />
                    {/* <Column title="目的地" dataIndex="endLocation" key="endLocation" /> */}
                    {/* <Column title="货物类型" dataIndex="cargoType" key="cargoType" /> */}
                    {/* <Column title="车型" dataIndex="carModel" key="carModel" /> */}
                    <Column title="提货厂区" dataIndex="extra" key="extra" render={(v) => {
                        return <span>{v ? JSON.parse(v).filter((it:any) => it.key === 'getCargoLocation')[0].value : ''}</span>
                    }}/>
                    <Column title="是否压车" dataIndex="carWait" key="carWait" render={(v) => {
                        return <span>{v ? "是" : "否"}</span>
                    }}/>
                    <Column title="货物体积" dataIndex="cargoVolume" key="cargoVolume" render={(v) => {
                        return <span>{v}立方</span>
                    }}/>
                    
                    {user?.role === 1 && <Column title="客户公司" dataIndex="clientName" key="clientName" />}
                    {/* <Column title="下单人" dataIndex="sender" key="sender" /> */}
                    <Column title="收货联系人" dataIndex="receiver" key="receiver" />
                    <Column title="收货公司" dataIndex="receiveCompany" key="receiveCompany" />
                    <Column
                        title="提货时间"
                        dataIndex="pickUpDate"
                        key="pickUpDate"
                        render={(time) => {
                            return <span>{time ? dayjs(new Date(time)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                        }}
                    />
                    <Column
                        title="要求送达时间"
                        dataIndex="eta"
                        key="eta"
                        render={(time) => {
                            return <span>{time ? dayjs(new Date(time)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                        }}
                    />
                    <Column
                        title="下单时间"
                        dataIndex="createdAt"
                        key="createdAt"
                        render={(time) => {
                            return <span>{time ? dayjs(new Date(time)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                        }}
                    />
                    <Column
                        title="结束时间"
                        dataIndex="endTime"
                        key="endTime"
                        render={(time) => {
                            return <span>{time ? dayjs(new Date(time)).format('YYYY/MM/DD HH:mm:ss') : '--'}</span>
                        }}
                    />
                    {/* <Column title="备注" dataIndex="remark" key="remark" /> */}
                    <Column
                        title="操作"
                        key="action"
                        render={(_: any, record: OrderInfo) => (
                            <Space size="middle">
                                <a onClick={() => onClickOrderDetail(record)}><EyeOutlined />查看</a>
                                {record.status !== 99 && <Popconfirm
                                    title="取消订单"
                                    description="是否确定取消订单?"
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
                title={form.getFieldValue('id') ? "订单详情" : "创建订单"}
                open={open}
                confirmLoading={confirmLoading}
                onCancel={() => setOpen(false)}
                footer={null}
            >
                <Form
                    labelCol={{
                        xs: { span: 24 },
                        sm: { span: 8 },
                    }}
                    wrapperCol={{
                        xs: { span: 24 },
                        sm: { span: 16 },
                    }}
                    form={form}
                    onFinish={onFinish}
                    style={{ maxWidth: 600 }}
                    scrollToFirstError
                >
                    {
                        form.getFieldValue('id') &&
                        <Form.Item
                            name="id"
                            label="订单ID"
                        >
                            <Input disabled />
                        </Form.Item>
                    }
                    <Form.Item
                        name="cargoVolume"
                        label="货物体积"
                        rules={[{ required: true, message: '请输入货物体积!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} suffix="立方"/>
                    </Form.Item>
                    {/* <Form.Item
                        name="cargoType"
                        label="货物类型"
                        rules={[{ required: true, message: '请选择货物类型!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} />
                    </Form.Item> */}
                    {/* <Form.Item
                        name="cargoCount"
                        label="货物数量"
                        rules={[{ required: true, message: '请输入货物数量!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} suffix="箱"/>
                    </Form.Item> */}
                    {/* <Form.Item
                        name="cargoWeight"
                        label="货物重量"
                        rules={[{ required: true, message: '请输入货物重量!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} suffix="千克"/>
                    </Form.Item> */}
                    {/* <Form.Item
                        name="carModel"
                        label="车型"
                        rules={[{ required: true, message: '请输入车型!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} />
                    </Form.Item> */}
                    <Form.Item
                        name="carWait"
                        label="是否压车"
                        rules={[{ required: true, message: '请选择是否压车!' }]}
                    >
                        <Select disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} placeholder={'请选择是否压车'} options={[
                            { label: '是', value: true },
                            { label: '否', value: false },
                        ]} allowClear />
                    </Form.Item>

                    <Form.Item
                        name="getCargoLocation"
                        label="提货厂区"
                        rules={[{ required: true, message: '请选择提货厂区!' }]}
                    >
                        <Select disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} placeholder={'请选择提货厂区'} options={getCargoLocationList} allowClear />
                    </Form.Item>
                    
                    {/* <Form.Item
                        name="endLocationCode"
                        label="目的地"
                        rules={[{ required: true, message: '请选择目的地!' }]}
                    >
                        <Cascader disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} placeholder={'请选择目的地'} options={CityList} allowClear />
                    </Form.Item> */}
                    {user?.role === 1 && <Form.Item
                        name="clientId"
                        label="客户公司名称"
                        rules={[{ required: true, message: '请选择客户公司!' }]}
                    >
                        <Select disabled={user?.role !== 1} placeholder={'请选择客户公司'} options={clientList} allowClear />
                    </Form.Item>}
                    <Form.Item
                        name="sender"
                        label="下单人"
                        rules={[{ required: true, message: '请输入下单人姓名!' }]}
                    >
                        <Input disabled={user?.role !== 1} />
                    </Form.Item>
                    <Form.Item
                        name="senderPhone"
                        label="下单人手机号"
                        rules={[{ required: true, message: '请输入下单人手机号!' }]}
                    >
                        <Input disabled={user?.role !== 1} />
                    </Form.Item>
                    <Form.Item
                        name="receiveCompany"
                        label="收货公司"
                        rules={[{ required: true, message: '请输入收货公司!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} />
                    </Form.Item>
                    <Form.Item
                        name="endAddress"
                        label="目的地详细地址"
                        rules={[{ required: true, message: '请输入目的地详细地址!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} />
                    </Form.Item>
                    <Form.Item
                        name="receiver"
                        label="收货联系人"
                        rules={[{ required: true, message: '请输入收货人姓名!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} />
                    </Form.Item>
                    <Form.Item
                        name="receiverPhone"
                        label="收货联系人手机号"
                        rules={[{ required: true, message: '请输入收货人手机号!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} />
                    </Form.Item>
                    <Form.Item
                        label="预计提货时间"
                        name="pickUpDate"
                        rules={[{ required: true, message: '请选择提货时间!' }]}
                    >
                        <DatePicker disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} showTime />
                    </Form.Item>
                    <Form.Item
                        label="要求送达时间"
                        name="eta"
                        rules={[{ required: true, message: '请选择要求送达时间!' }]}
                    >
                        <DatePicker disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} showTime />
                    </Form.Item>
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginBottom: '16px' }}>
                            <p style={{ marginLeft: '15%' }}>其他要求:</p>
                            <Button 
                                style={{ marginLeft: '5%' }}
                                type="dashed" 
                                icon={<PlusCircleOutlined />}
                                onClick={addCustomItem}
                                disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99}
                            >
                                添加要求
                            </Button>
                        </div>
                        
                        {customItems.length > 0 && (
                            <div style={{ marginBottom: '20px', marginLeft: '15%' }}>
                                {customItems.map((item, index) => (
                                    <div key={index} style={{ 
                                        display: 'flex', 
                                        marginBottom: '8px',
                                        alignItems: 'flex-start', 
                                        gap: '8px' 
                                    }}>
                                        <Input
                                            placeholder="属性名"
                                            value={item.key}
                                            style={{ width: '40%' }}
                                            onChange={(e) => updateCustomItem(index, 'key', e.target.value)}
                                            disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99}
                                        />:
                                        <Input
                                            placeholder="属性值"
                                            value={item.value}
                                            style={{ width: '40%' }}
                                            onChange={(e) => updateCustomItem(index, 'value', e.target.value)}
                                            disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99}
                                        />
                                        <Button 
                                            danger
                                            icon={<DeleteOutlined />}
                                            onClick={() => removeCustomItem(index)}
                                            disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <Form.Item
                        name="remark"
                        label="备注"
                    // rules={[{ required: true, message: 'Please input the description' }]}
                    >
                        <Input.TextArea showCount maxLength={200} />
                    </Form.Item>
                    <Form.Item {...tailFormItemLayout}>
                        {(form.getFieldValue('id') === undefined || form.getFieldValue('status') == 1) && <Button type="primary" htmlType="submit">
                            提交
                        </Button>}
                        {form.getFieldValue('status') == 1 && <Button style={{ marginLeft: '10px' }} type="primary" onClick={() => finishOrder(form.getFieldValue('id'))}> 已完成 </Button>}
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}