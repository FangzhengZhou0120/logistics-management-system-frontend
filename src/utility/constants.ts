export const waybillStatusMap = new Map([
    [0, "初始化"],
    [1, "进行中"],
    [2, "已完成"],
    [99, "已取消"],
    [-1, "异常"],
]);

export const orderStatusMap = new Map([
    [0, "已下单"],
    [1, "已派车"],
    [2, "已送达"],
    [99, "已取消"],
    [-1, "异常"],
]);

export const cargoTypeMap = new Map([
    [1, "食品"],
    [2, "玩具"],
    [3, "服装"],
    [4, "电子"],
    [99, "其他"],
]);

export const carNumberColorMap = new Map([
    [1, "蓝色"],
    [2, "黄色"],
    [3, "黄绿"],
]);

export const roleMap = new Map([
    [1, "管理员"],
    [2, "司机"],
    [3, "客户"],
]);

export const getCargoLocationList = [
    { label: "维尔一期", value: "维尔一期" },
    { label: "维尔二期", value: "维尔二期" },
    { label: "维尔一期 + 二期", value: "维尔一期 + 二期" },
];

export const carTypeList = [
    { label: "4.2米", value: "4.2米" },
    { label: "7.6米", value: "7.6米" },
    { label: "9.6米", value: "9.6米" },
]