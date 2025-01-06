import { Fragment, useCallback, useRef, useState } from 'react';
import { SearchBar, SearchFilter } from '../../component/search-bar/search-bar'
import { Button, Cascader, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Upload, UploadProps } from 'antd';
import { cancelWaybill, createWaybill, getWaybillList, WaybillInfo } from '../../api/waybill';
import { EditOutlined, StopOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './user-management.scss'
import { cargoTypeMap, waybillStatusMap } from '../../utility/constants';
import { createUser, deleteUser, getUserListMethod, UserInfo } from '../../api/user';

export const UserManagement = () => {
    const { Column } = Table
    const [form] = Form.useForm()
    const [open, setOpen] = useState(false);
    const [confirmLoading, setConfirmLoading] = useState(false);
    const [data, setData] = useState<UserInfo[]>([])
    const [pageIndex, setPageIndex] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [total, setTotal] = useState(0)
    const searchOption = useRef({})
    const filters: SearchFilter[] = [
        {
            type: 'input',
            name: 'userName',
            label: '用户名',
            placeholder: '请输入用户名',
            options: []
        },
        {
            type: 'select',
            multiple: true,
            name: 'role',
            label: '角色',
            placeholder: '请选择角色',
            options: [{label: '管理员', value: '1'}, {label: '司机', value: '2'}]
        },
    ]

    const getUserList = () => {
        return getUserListMethod(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
        }).catch(err => {
            message.error("获取用户列表失败", err.message)
        })
    }

    const onSearch = (values: any) => {
        searchOption.current = values
        setPageIndex(1)
        getUserList()
    }

    const onPageChange = (pageIndex: number, pageSize: number) => {
        getUserListMethod(pageIndex, pageSize, searchOption.current).then(res => {
            res.data.rows.forEach(it => it.key = it.id)
            setData(res.data.rows)
            setTotal(res.data.count)
            setPageIndex(pageIndex)
            setPageSize(pageSize)
        }).catch(err => {
            message.error('获取用户列表失败' + JSON.stringify(err))
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
        deleteUser(id).then(_ => {
            getUserList()
            message.success('删除用户成功')
        }).catch(err => {
            message.error('删除用户失败' + JSON.stringify(err))
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
        createUser(values).then((res) => {
            message.success('创建用户成功');
            setOpen(false)
            getUserList()
        }).catch(err => {
            message.error('创建用户失败' + JSON.stringify(err))
        })
    };

    return (
        <Fragment>
            <div className='searchBarUser'>
                <SearchBar filters={filters} onSearch={onSearch} createText='新建' onCreate={onCreate} />
            </div>
            <div className='tableUser'>
                <Table<UserInfo>
                    scroll={{ scrollToFirstRowOnChange: true }}
                    dataSource={data}
                    pagination={{
                        showSizeChanger: true,
                        current: pageIndex,
                        pageSize: pageSize,
                        total: total,
                        onChange: onPageChange
                    }}>
                    <Column title="用户ID" dataIndex="id" key="userId" />
                    <Column title="姓名" dataIndex="userName" key="userName" />
                    <Column title="角色" dataIndex="role" key="role" render={
                        (role: number) => {
                            return <span>{role === 1 ? "管理员": "司机"}</span>
                        }
                    } />
                    <Column title="手机号" dataIndex="phone" key="phone" />
                    <Column title="备注" dataIndex="remark" key="remark" />
                    <Column
                        title="操作"
                        key="action"
                        render={(_: any, record: WaybillInfo) => (
                            <Space size="middle">
                                <a><EditOutlined />修改</a>
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
                title={form.getFieldValue('id') ? "用户详情" : "添加用户"}
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
                            label="用户ID"
                        >
                            <Input disabled />
                        </Form.Item>
                    }
                    <Form.Item
                        name="userName"
                        label="姓名"
                        rules={[{ required: true, message: '请输入用户姓名!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="角色"
                        rules={[{ required: true, message: '请选择角色！' }]}
                    >
                        <Select placeholder={'请选择角色'} options={filters[1].options} allowClear />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="手机号"
                        rules={[{ required: true, message: 'Please input the Device SN!' }]}
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