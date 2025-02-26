import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { SearchBar, SearchFilter } from '../../component/search-bar/search-bar'
import { Button, Cascader, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Upload, UploadProps } from 'antd';
import { EditOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import './client-management.scss'
import { ClientInfo, createClient, getClientListData, updateClient } from '../../api/client';


export const ClientManagement = () => {
    const { Column } = Table
    const [form] = Form.useForm()
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [data, setData] = useState<ClientInfo[]>([])
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const searchOption = useRef({})
    const filters: SearchFilter[] = [
        {
            type: 'input',
            name: 'clientName',
            label: '公司名',
            placeholder: '请输入公司名',
            options: []
        }
    ]

    const getClientList = () => {
        return getClientListData(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
        }).catch(err => {
            message.error("获取公司列表失败" + err.message)
        })
    }

    const onSearch = (values: any) => {
        searchOption.current = values
        setPageIndex(1)
        getClientList()
    }

    const onPageChange = (pageIndex: number, pageSize: number) => {
        getClientListData(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
            setPageIndex(pageIndex)
            setPageSize(pageSize)
        }).catch(err => {
            message.error('获取客户列表失败' + JSON.stringify(err))
        })
    }

    const onCreate = useCallback(() => {
        form.resetFields()
        setOpen(true)
    }, [])

    const onClickUserDetail = (record: ClientInfo) => {
        form.setFieldsValue(record)
        setOpen(true)
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
            updateClient(values).then((res) => {
                message.success('更新客户成功');
                setOpen(false)
                getClientList()
            }).catch(err => {
                message.error('更新客户失败' + JSON.stringify(err))
            })
        } else {
            createClient(values).then((res) => {
                message.success('创建客户成功');
                setOpen(false)
                getClientList()
            }).catch(err => {
                message.error('创建客户失败' + JSON.stringify(err))
            })
        }
    };

    useEffect(() => {
        getClientList()
    },[])

    return (
        <Fragment>
            <div className='searchBarUser'>
                <SearchBar filters={filters} onSearch={onSearch} createText='新建' onCreate={onCreate} />
            </div>
            <div className='tableUser'>
                <Table<ClientInfo>
                    scroll={{ scrollToFirstRowOnChange: true }}
                    dataSource={data}
                    pagination={{
                        showSizeChanger: true,
                        current: pageIndex,
                        pageSize: pageSize,
                        total: total,
                        onChange: onPageChange
                    }}>
                    <Column title="客户ID" dataIndex="id" key="userId" />
                    <Column title="公司名称" dataIndex="clientName" key="clientName" />
                    <Column title="公司地址" dataIndex="address" key="address" />
                    <Column title="备注" dataIndex="remark" key="remark" />
                    <Column
                        title="操作"
                        key="action"
                        render={(_: any, record: ClientInfo) => (
                            <Space size="middle">
                                <a onClick={() => onClickUserDetail(record)}><EditOutlined />修改</a>
                            </Space>
                        )}
                    />
                </Table>
            </div>
            <Modal
                title={form.getFieldValue('id') ? "客户详情" : "添加客户"}
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
                            label="客户ID"
                        >
                            <Input disabled />
                        </Form.Item>
                    }
                    <Form.Item
                        name="clientName"
                        label="公司名称"
                        rules={[{ required: true, message: '请输入客户公司名称!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="address"
                        label="公司地址"
                        rules={[{ required: true, message: '请输入公司地址!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="remark"
                        label="备注"
                    >
                        <Input.TextArea showCount maxLength={200} />
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