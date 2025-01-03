import { Fragment, useCallback, useRef, useState } from 'react';
import { SearchBar, SearchFilter } from '../../component/search-bar/search-bar'
import { Button, Cascader, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Upload, UploadProps } from 'antd';
import { cancelWaybill, createWaybill, getWaybillList, WaybillInfo } from '../../api/waybill';
import { StopOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './waybill-management.scss'
import { cargoTypeMap, waybillStatusMap } from '../../utility/constants';

export const WaybillManagement = () => {
    const { Column } = Table
    const [form] = Form.useForm()
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [data, setData] = useState<WaybillInfo[]>([])
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const searchOption = useRef({})
    const filters: SearchFilter[] = [
        {
            type: 'input',
            name: 'carNumber',
            label: '车牌号',
            placeholder: '请输入车牌号',
            options: []
        },
        {
            type: 'select',
            multiple: true,
            name: 'driverId',
            label: '司机',
            placeholder: '请选择司机',
            options: []
        },
        {
            type: 'cascader',
            name: 'startLocation',
            label: '始发地',
            placeholder: '请选择始发地',
            options: []
        },
        {
            type: 'cascader',
            name: 'endLocation',
            label: '目的地',
            placeholder: '请选择目的地',
            options: []
        },
        {
            type: 'input',
            name: 'GPSDeviceSN',
            label: 'GPS设备号',
            placeholder: '请输入GPS设备号',
            options: []
        },
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
            type: 'dateRange',
            name: 'startTime',
            label: '出发日期',
            placeholder: '请选择出发日期',
            options: []
        },
    ]

    const getWaybillListMethod = () => {
        return getWaybillList(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
        }).catch(err => {
            message.error("获取运单列表失败", err.message)
        })
    }

    const onSearch = (values: any) => {
        searchOption.current = values
        setPageIndex(1)
        getWaybillListMethod()
    }

    const onPageChange = (pageIndex: number, pageSize: number) => {
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
        setOpen(true)
    }, [])

    const uploadOp: UploadProps = {
        action: '/upload',
        onChange: ({ file, fileList }) => {
            console.log(file, fileList)
        }
    }

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
                span: 16,
                offset: 8,
            },
        },
    };

    const onFinish = (values: any) => {
        createWaybill(values).then((res) => {
            message.success('创建运单成功');
            setOpen(false)
            getWaybillListMethod()
        }).catch(err => {
            message.error('创建运单失败' + JSON.stringify(err))
        })
    };

    return (
        <Fragment>
            <div className='searchBar'>
                <SearchBar filters={filters} onSearch={onSearch} createText='新建' onCreate={onCreate} />
            </div>
            <div className='table'>
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
                    <Column title="运单ID" dataIndex="id" key="waybillId" render={(text) => <a >{text}</a>} />
                    <Column title="车牌号" dataIndex="carNumber" key="carNumber" />
                    <Column title="运单状态" dataIndex="status" key="status" render={
                        (status: number) => {
                            return <span>{waybillStatusMap.get(status)}</span>
                        }
                    } />
                    <Column title="始发地" dataIndex="startLocation" key="startLocation" />
                    <Column title="目的地" dataIndex="endLocation" key="endLocation" />
                    <Column title="货物类型" dataIndex="cargoType" key="cargoType" render={
                        (type: number) => {
                            return <span>{cargoTypeMap.get(type)}</span>
                        }
                    } />
                    <Column title="GPS设备编号" dataIndex="GPSDeviceSN" key="GPSDeviceSN" />
                    <Column
                        title="出发时间"
                        dataIndex="startTime"
                        key="startTime"
                        render={(time) => {
                            return <span>{time ? dayjs(new Date(time)).format('YYYY/MM/DD hh:mm:ss') : '--'}</span>
                        }}
                    />
                    <Column
                        title="到达时间"
                        dataIndex="endTime"
                        key="endTime"
                        render={(time) => {
                            return <span>{time ? dayjs(new Date(time)).format('YYYY/MM/DD hh:mm:ss') : '--'}</span>
                        }}
                    />
                    <Column title="备注" dataIndex="remark" key="remark" />
                    <Column
                        title="操作"
                        key="action"
                        render={(_: any, record: WaybillInfo) => (
                            <Space size="middle">
                                <Popconfirm
                                    title="取消运单"
                                    description="是否确定取消运单?"
                                    onConfirm={(e) => confirmAbort(record.id)}
                                    okText="是"
                                    cancelText="否"
                                >
                                    <a><StopOutlined />取消</a>
                                </Popconfirm>
                            </Space>
                        )}
                    />
                </Table>
            </div>
            <Modal
                title="创建运单"
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
                    <Form.Item
                        name="carNumber"
                        label="车牌号"
                        rules={[{ required: true, message: '请输入车牌号!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="driverId"
                        label="司机"
                        rules={[{ required: true, message: '请选择司机!' }]}
                    >
                        <Select placeholder={'请选择司机'} options={filters[4].options} allowClear />
                    </Form.Item>
                    <Form.Item
                        name="cargoType"
                        label="货物类型"
                        rules={[{ required: true, message: '请选择货物类型!' }]}
                    >
                        <Select placeholder={'请选择货物类型'} options={filters[4].options} allowClear />
                    </Form.Item>
                    <Form.Item
                        name="startLocationCode"
                        label="始发地"
                        rules={[{ required: true, message: '请选择始发地!' }]}
                    >
                        <Cascader placeholder={'请选择始发地'} options={filters[1].options} allowClear />
                    </Form.Item>
                    <Form.Item
                        name="endLocationCode"
                        label="目的地"
                        rules={[{ required: true, message: '请选择目的地!' }]}
                    >
                        <Cascader placeholder={'请选择目的地'} options={filters[1].options} allowClear />
                    </Form.Item>
                    <Form.Item
                        name="GPSDeviceSN"
                        label="GPS设备编号"
                        rules={[{ required: true, message: '请输入GPS设备编号!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="出发时间"
                        name="startTime"
                        rules={[{ required: true, message: '请选择出发时间!' }]}
                    >
                        <DatePicker showTime />
                    </Form.Item>
                    <Form.Item
                        name="remark"
                        label="备注"
                    // rules={[{ required: true, message: 'Please input the description' }]}
                    >
                        <Input.TextArea showCount maxLength={200} />
                    </Form.Item>

                    <Form.Item
                        label="出发前检查"
                        name="uploadFiles"
                    >
                        <Upload {...uploadOp}>
                            <Button icon={<UploadOutlined />}>上传</Button>
                        </Upload>
                    </Form.Item>
                    <Form.Item {...tailFormItemLayout}>
                        <Button type="primary" htmlType="submit">
                            提交
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Fragment>
    )
}