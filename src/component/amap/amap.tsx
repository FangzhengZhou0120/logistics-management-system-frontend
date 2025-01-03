import { useEffect } from "react";
import "./amap.scss";
import AMapLoader from "@amap/amap-jsapi-loader";
import { WaybillInfo } from "../../api/waybill";

declare global {
  interface Window {
    _AMapSecurityConfig: any;
  }
}

interface AMapComponentProps {
  center: [number, number],
}

export const AMapComponent = ({ center }: AMapComponentProps) => {
  let map:any = null;

  useEffect(() => {
    window._AMapSecurityConfig = {
      securityJsCode: "d3d86ddc45f308403b9380713d42aeff",
    };
    AMapLoader.load({
      key: "f665ab0ee4638e750d5da353cc3c879c", // 申请好的Web端开发者Key，首次调用 load 时必填
      version: "2.0", // 指定要加载的 JSAPI 的版本，缺省时默认为 1.4.15
      plugins: ["AMap.Scale"], //需要使用的的插件列表，如比例尺'AMap.Scale'，支持添加多个如：['...','...']
    })
      .then((AMap) => {
        map = new AMap.Map("amap_container", {
          // 设置地图容器id
          // viewMode: "3D", // 是否为3D地图模式
          zoom: 11, // 初始化地图级别
          center: center, // 初始化地图中心点位置
        });
      })
      .catch((e) => {
        console.log(e);
      });

    return () => {
      map?.destroy();
    };
  }, []);

  return (
    <div
      id="amap_container"
      className="map-container"
    ></div>
  );
}