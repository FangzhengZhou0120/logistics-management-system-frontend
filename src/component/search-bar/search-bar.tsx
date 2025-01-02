import { Input, Select, Button, Form, Row, Col, DatePicker, Cascader } from 'antd';
import { FC } from "react";

export interface SearchFilterOption {
    label: string,
    value: string,
    children?: SearchFilterOption[];
}
export interface SearchFilter {
    type: string,
    name: string,
    label: string,
    options: SearchFilterOption[],
    placeholder: string,
    multiple?: boolean,
}
export const SearchBar: FC<{ filters: SearchFilter[], onSearch: Function, createText: string, onCreate: Function }> = ({ filters, onSearch, createText, onCreate }) => {
    const [form] = Form.useForm();

    const handleSearch = () => {
        const values = form.getFieldsValue();
        onSearch(values);
    };

    const handleCreate = () => {
        onCreate()
    }

    const renderFilterInput = (filter: SearchFilter) => {
        const { type, name, label, options, placeholder } = filter;
        if (type === 'select') {
            return (
                <Form.Item key={name} name={name} label={label}>
                    <Select 
                        mode={filter.multiple ? 'multiple' : undefined} 
                        placeholder={placeholder || 'Please select'} 
                        options={options} 
                        maxTagCount={1}
                        onClear={() => form.setFieldValue(name, undefined)}
                        allowClear>
                    </Select>
                </Form.Item>
            );
        }

        if (type === 'dateRange') {
            return (
                <Form.Item key={name} name={name} label={label}>
                    <DatePicker.RangePicker
                        showTime
                        format="YYYY/MM/DD HH:mm:ss"
                    />
                </Form.Item>
            )
        }

        if(type === 'cascader') {
            return (
                <Form.Item key={name} name={name} label={label}>
                    <Cascader options={options} placeholder={placeholder || 'Please select'} allowClear onClear={() => form.setFieldValue(name, undefined)} />
                </Form.Item>
            )
        }

        return (
            <Form.Item key={name} name={name} label={label}>
                <Input placeholder={placeholder || 'Please input'} allowClear />
            </Form.Item>
        );
    };

    return (
        <Form form={form} layout="inline" labelCol={{
            xs: { span: 24 },
            sm: { span: 8 },
        }}
            wrapperCol={{
                xs: { span: 24 },
                sm: { span: 16 },
            }}>
            <Row gutter={[16, 16]} wrap justify={'end'}>
                {filters.map((filter: any) => (
                    <Col
                        key={filter.name}
                        xs={24} sm={12} md={8} lg={8} xl={8}
                    >
                        {renderFilterInput(filter)}
                    </Col>
                ))}
                <Col flex={'auto'}></Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={6} flex={'none'}>
                    <Form.Item>
                        <Button type="primary" onClick={handleSearch}>
                            Search
                        </Button>
                    </Form.Item>
                </Col>
                <Col xs={24} sm={12} md={8} lg={8} xl={6} flex={'none'}>
                    <Button type="primary" onClick={handleCreate}>
                        {createText}
                    </Button>
                </Col>
            </Row>
        </Form>
    );
}