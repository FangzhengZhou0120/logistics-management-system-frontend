import { Fragment, useCallback, useRef, useState } from 'react';
import { SearchBar, SearchFilter } from '../../component/search-bar/search-bar'
import { Button, Cascader, DatePicker, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Upload, UploadProps } from 'antd';
import { cancelWaybill, createWaybill, getWaybillList, WaybillInfo } from '../../api/waybill';
import { StopOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './waybill-detail.scss'
import { cargoTypeMap, waybillStatusMap } from '../../utility/constants';
import { AMapComponent } from '../../component/amap/amap';

export const WaybillDetail = () => {
    return (
        <AMapComponent center={[105.602725,37.076636]}/>
    )
}