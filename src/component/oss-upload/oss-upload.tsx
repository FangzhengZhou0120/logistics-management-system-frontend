import React, { useEffect, useRef, useState } from 'react';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { Button, Form, Image, message, Upload } from 'antd';
import { getUploadConfig, UploadConfig } from '../../api/waybill';
import { convertToDate } from '../../utility/helper';
import dayjs from 'dayjs';
import { GetProp } from 'antd/lib';

interface OSSDataType {
    dir: string;
    expire: string;
    host: string;
    accessId: string;
    policy: string;
    signature: string;
}

interface AliyunOSSUploadProps {
    value?: UploadFile[];
    onChange?: (fileList: UploadFile[]) => void;
    key?: string;
}

const AliyunOSSUpload = ({ value, onChange, key }: AliyunOSSUploadProps) => {
    type FileType = Parameters<GetProp<UploadProps, 'beforeUpload'>>[0]
    const [OSSData, setOSSData] = useState<UploadConfig>();
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('')
    const now = useRef(new Date());

    // Mock get OSS api
    // https://help.aliyun.com/document_detail/31988.html
    //   const mockGetOSSData = () => ({
    //     dir: 'user-dir/',
    //     expire: '1577811661',
    //     host: 'https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload',
    //     accessId: 'c2hhb2RhaG9uZw==',
    //     policy: 'eGl4aWhhaGFrdWt1ZGFkYQ==',
    //     signature: 'ZGFob25nc2hhbw==',
    //   });

    const init = async () => {
        try {
            const result = await getUploadConfig();
            setOSSData(result.data);
        } catch (error) {
            message.error(error as string);
        }
    };

    useEffect(() => {
        init();
    }, []);

    const getBase64 = (file: FileType): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
        });

    const handleChange: UploadProps['onChange'] = ({ fileList }) => {
        console.log('Aliyun OSS:', fileList);
        onChange?.([...fileList]);
    };

    const handlePreview = async (file: UploadFile) => {
        if (!file.preview) {
            file.preview = await getBase64(file.originFileObj as FileType);
        }
        setPreviewImage(file.preview as string);
        setPreviewOpen(true);
    }

    const onRemove = (file: UploadFile) => {
        const files = (value || []).filter((v) => v.url !== file.url);

        if (onChange) {
            onChange(files);
        }
    };

    const getExtraData: UploadProps['data'] = (file) => ({
        success_action_status: '200',
        policy: OSSData?.policy,
        'x-oss-signature': OSSData?.signature,
        'x-oss-signature-version': OSSData?.version,
        'x-oss-credential': OSSData?.credential,
        'x-oss-date': OSSData?.ossdate,
        key: file.url,
        'x-oss-security-token': OSSData?.token,
    });

    const beforeUpload: UploadProps['beforeUpload'] = async (file) => {
        if (!OSSData) return false;

        const expire = Number(convertToDate(OSSData.ossdate).getTime()) + 3600 * 1000;

        if (expire < Date.now()) {
            await init();
        }

        const suffix = file.name.slice(file.name.lastIndexOf('.'));
        const filename = Date.now() + suffix;
        // @ts-ignore
        file.url = [OSSData?.dir, dayjs(now.current).format("YYYY/MM/DD"), filename].join('/');

        return file;
    };

    const uploadProps: UploadProps = {
        name: 'file',
        fileList: value,
        action: OSSData?.host,
        onChange: handleChange,
        onRemove,
        data: getExtraData,
        beforeUpload,
        listType: "picture-card",
        onPreview: handlePreview
    };

    return (
        <>
        <Upload key={key} {...uploadProps}>
            <button style={{ border: 0, background: 'none' }} type="button">
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>上传</div>
            </button>
        </Upload>
        {previewImage && (
            <Image
              wrapperStyle={{ display: 'none' }}
              preview={{
                visible: previewOpen,
                onVisibleChange: (visible) => setPreviewOpen(visible),
                afterOpenChange: (visible) => !visible && setPreviewImage(''),
              }}
              src={previewImage}
            />
          )}
    </>
    );
};

export default AliyunOSSUpload;