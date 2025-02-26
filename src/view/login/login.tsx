import { useRef, useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import SliderCaptcha, { ActionType } from 'rc-slider-captcha';
import './login.scss';
import { login } from '../../api/user';
import { useAuth } from '../../context/user-context';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
    const [loading, setLoading] = useState(false);
    const actionRef = useRef<ActionType>();
    const [canLogin, setCanLogin] = useState(false);
    const { setUser } = useAuth();
    const navigate = useNavigate();

    const controlBarWidth = 320;
    const controlButtonWidth = 40;
    const indicatorBorderWidth = 2;

    const onFinish = async (values: { phone: string; password: string }) => {
        try {
            setLoading(true);
            const user = await login(values.phone, values.password);
            setUser(user.data);
            message.success('登录成功!');
            navigate('/waybill-list');
            // TODO: Handle successful login (e.g., redirect to dashboard)
        } catch (error:any) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1 style={{color: 'black'}}>呱呱物流管理系统</h1>
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="手机号"
                        name="phone"
                        rules={[
                            { required: true, message: '请输入手机号!' },
                            { pattern: /^[0-9]{11}$/, message: '请输入有效手机号!' }
                        ]}
                    >
                        <Input placeholder="请输入手机号" />
                    </Form.Item>
                    <Form.Item
                        label="密码"
                        name="password"
                        rules={[{ required: true, message: '请输入密码!' }]}
                    >
                        <Input.Password placeholder="请输入密码" />
                    </Form.Item>

                    <div className='captcha'>
                        <SliderCaptcha
                            mode="slider"
                            tipText={{
                                default: '请按住滑块，拖动到最右边',
                                moving: '请按住滑块，拖动到最右边',
                                error: '验证失败，请重新操作',
                                success: '验证成功'
                            }}
                            errorHoldDuration={1000}
                            // 手动设置拼图宽度等于滑块宽度。后面大版本更新会将该模式下的拼图宽度改为和滑块宽度一致。
                            puzzleSize={{
                                left: indicatorBorderWidth,
                                width: controlButtonWidth
                            }}
                            onVerify={(data:any) => {
                                console.log(data);
                                if (data.x === controlBarWidth - controlButtonWidth - indicatorBorderWidth) {
                                    setCanLogin(true);
                                    return Promise.resolve();
                                }
                                return Promise.reject();
                            }}
                            actionRef={actionRef}
                        />
                    </div>

                    <Form.Item>
                        <Button disabled={!canLogin} type="primary" htmlType="submit" loading={loading} block>
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};