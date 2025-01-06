import { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import './login.scss';

export const Login = () => {
    const [loading, setLoading] = useState(false);

    const onFinish = async (values: { phone: string; password: string }) => {
        try {
            setLoading(true);
            // TODO: Replace with your actual API call
            // const response = await loginApi(values.phone, values.password);
            
            message.success('Login successful!');
            // TODO: Handle successful login (e.g., redirect to dashboard)
        } catch (error) {
            message.error('Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Login</h1>
                <Form
                    name="login"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        label="Phone Number"
                        name="phone"
                        rules={[
                            { required: true, message: 'Please input your phone number!' },
                            { pattern: /^[0-9]{10}$/, message: 'Please enter a valid phone number!' }
                        ]}
                    >
                        <Input placeholder="Enter your phone number" />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please input your password!' }]}
                    >
                        <Input.Password placeholder="Enter your password" />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Log in
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        </div>
    );
};