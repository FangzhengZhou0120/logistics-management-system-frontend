import { useEffect } from "react";
import "./amap.scss";
import AMapLoader from "@amap/amap-jsapi-loader";
import { WaybillInfo } from "../../api/waybill";
import { CarPositionInfo, TrajectoryInfo } from "../../api/position";
import { wgs84togcj02 } from "../../utility/gps-helper";

declare global {
  interface Window {
    _AMapSecurityConfig: any;
  }
}

interface AMapComponentProps {
  waybill: WaybillInfo;
  positionInfo: CarPositionInfo;
  trajectoryInfo: TrajectoryInfo[];
}

export const AMapComponent = ({ waybill, positionInfo, trajectoryInfo }: AMapComponentProps) => {
  let map: any = null;

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
        const carPosition = wgs84togcj02(positionInfo.lon, positionInfo.lat);
        console.log(carPosition)
        map = new AMap.Map("amap_container", {
          // 设置地图容器id
          viewMode: "2D", // 是否为3D地图模式
          zoom: 11, // 初始化地图级别
          center: carPosition // 初始化地图中心点位置
        });
        const content = `
          <div class="custom-content-marker">
            <div class="text-${waybill.carNumberColor}">${waybill.carNumber}</div>
            <img src="https://cdn3.iconfinder.com/data/icons/set-cars-and-vehicles-etc/125/Vehicle_01-1024.png" alt="车辆图标" />
          </div>
        `
        const marker = new AMap.Marker({
          content: content, //自定义点标记覆盖物内容
          position: carPosition, //基点位置
          offset: new AMap.Pixel(-13, -30), //相对于基点的偏移位置
        });
        map.add(marker);

        const carPath = new AMap.Polyline({
          map: map,
          path: trajectoryInfo.map((item) => {
            return wgs84togcj02(item.longitude, item.latitude);
          }), // 设置线覆盖物路径
          showDir: true,
          strokeColor: "#28F",  //线颜色
          // strokeOpacity: 1,     //线透明度
          strokeWeight: 6,      //线宽
          // strokeStyle: "solid"  //线样式
        });
        map.add(carPath);
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