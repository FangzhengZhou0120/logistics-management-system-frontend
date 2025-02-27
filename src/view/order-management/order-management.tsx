import { Children, Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { SearchBar, SearchFilter } from '../../component/search-bar/search-bar'
import { Button, Cascader, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Upload, UploadProps } from 'antd';
import { EditOutlined, EyeOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './order-management.scss'
import { cargoTypeMap, carNumberColorMap, waybillStatusMap } from '../../utility/constants';
import { getUserByRole } from '../../api/user';
import { useNavigate } from 'react-router-dom';
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
    const clientMap = useRef(new Map<string, string>())

    const filters: SearchFilter[] = [
        {
            type: 'select',
            multiple: true,
            name: 'cargoType',
            label: '货物类型',
            placeholder: '请选择货物类型',
            options: [
                { value: '1', label: '食品' },
                { value: '2', label: '玩具' },
                { value: '3', label: '服装' },
                { value: '4', label: '电子' },
                { value: '99', label: '其他' },
            ]
        },
        {
            type: 'select',
            multiple: true,
            name: 'status',
            label: '订单状态',
            placeholder: '请选择订单状态',
            options: [
                { value: '1', label: '进行中' },
                { value: '2', label: '已完成' },
                { value: '-1', label: '异常' },
                { value: '99', label: '已取消' },
            ]
        },
        {
            type: 'select',
            multiple: true,
            name: 'clientId',
            label: '客户公司',
            placeholder: '请选择客户公司',
            options: clientList
        },
    ]

    const getOrderListMethod = () => {
        return getOrderList(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
        }).catch(err => {
            message.error("获取订单列表失败"+err.message)
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
        if(values.id) {
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
        //values.startTime = new Date(values.startTime).getTime()
        //values.startLocation = (CityMap.get(values.startLocationCode[0]) || '') + (CityMap.get(values.startLocationCode[1]) || '') + (CityMap.get(values.startLocationCode[2]) || '')
        values.endLocation = (CityMap.get(values.endLocationCode[0]) || '') + (CityMap.get(values.endLocationCode[1]) || '') + (CityMap.get(values.endLocationCode[2]) || '')
        //values.startLocationCode = values.startLocationCode.join(',')
        values.endLocationCode = values.endLocationCode.join(',')
        values.clientId = Number(values.clientId)
        values.clientName = clientMap.current.get(values.clientId.toString())
        // values.driverName = driverMap.current.get(values.driverId)
        // values.fileList = values.fileList.map((it: any) => it.url).join(',')
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
            endLocationCode: record.endLocationCode.split(','),
            clientId: record.clientId.toString(),
        })
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
                            return <span>{waybillStatusMap.get(status)}</span>
                        }
                    } />
                    <Column title="目的地" dataIndex="endLocation" key="endLocation" />
                    <Column title="货物类型" dataIndex="cargoType" key="cargoType" render={
                        (type: number) => {
                            return <span>{cargoTypeMap.get(type)}</span>
                        }
                    } />
                    <Column title="货物数量" dataIndex="cargoCount" key="cargoCount" />
                    <Column title="客户公司" dataIndex="clientName" key="clientName" />
                    <Column title="发货人" dataIndex="sender" key="sender" />
                    <Column title="收货人" dataIndex="receiver" key="receiver" />
                    <Column title="备注" dataIndex="remark" key="remark" />
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
                                {record.status === 99 && <span style={{color: 'gray'}}><StopOutlined />取消</span>}
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
                        name="cargoType"
                        label="货物类型"
                        rules={[{ required: true, message: '请选择货物类型!' }]}
                    >
                        <Select disabled={form.getFieldValue('id') !== undefined} placeholder={'请选择货物类型'} options={filters[0].options} allowClear />
                    </Form.Item>
                    <Form.Item
                        name="cargoCount"
                        label="货物数量"
                        rules={[{ required: true, message: '请输入货物数量!' }]}
                    >
                        <Input disabled={form.getFieldValue('id') !== undefined} />
                    </Form.Item>
                    <Form.Item
                        name="endLocationCode"
                        label="目的地"
                        rules={[{ required: true, message: '请选择目的地!' }]}
                    >
                        <Cascader disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} placeholder={'请选择目的地'} options={CityList} allowClear />
                    </Form.Item>
                    <Form.Item
                        name="endAddress"
                        label="目的地详细地址"
                        rules={[{ required: true, message: '请输入目的地详细地址!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} />
                    </Form.Item>
                    <Form.Item
                        name="clientId"
                        label="客户公司名称"
                        rules={[{ required: true, message: '请选择客户公司!' }]}
                    >
                        <Select disabled={user?.role !== 1} placeholder={'请选择客户公司'} options={clientList} allowClear />
                    </Form.Item>
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
                        name="receiver"
                        label="收货人"
                        rules={[{ required: true, message: '请输入收货人姓名!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} />
                    </Form.Item>
                    <Form.Item
                        name="receiverPhone"
                        label="收货人手机号"
                        rules={[{ required: true, message: '请输入收货人手机号!' }]}
                    >
                        <Input disabled={form.getFieldValue('status') == 2 || form.getFieldValue('status') == 99} />
                    </Form.Item>
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
                        {form.getFieldValue('status') == 1 && <Button style={{marginLeft: '10px'}} type="primary" onClick={() => finishOrder(form.getFieldValue('id'))}> 已完成 </Button>} 
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}