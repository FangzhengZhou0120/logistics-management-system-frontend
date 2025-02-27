import { useEffect, useState } from 'react'
import { useOutlet, useNavigate } from 'react-router-dom';
import KeepAlive from 'keepalive-for-react'
import './App.css'
import { Avatar, Menu, MenuProps } from 'antd';
import { ShopOutlined, SolutionOutlined, TruckOutlined, UserOutlined } from '@ant-design/icons';
import AMapLoader from "@amap/amap-jsapi-loader";
import { useAuth } from './context/user-context';
import { logout } from './api/user';

function App() {
  const navigate = useNavigate()
  const outlet = useOutlet()
  const {user} = useAuth()
  type MenuItem = Required<MenuProps>['items'][number];
  const [current, setCurrent] = useState(location.pathname === '/' ? '/waybill-list' : location.pathname)
  const items: MenuItem[] = [
    {
      label: '订单管理',
      key: '/order-list',
      icon: <SolutionOutlined />,
    },
    {
      label: '运单中心',
      key: '/waybill-list',
      icon: <TruckOutlined />,
    },
    {
      label: '用户管理',
      key: '/user-list',
      icon: <UserOutlined />,
      disabled: user?.role !== 1
    },
    {
      label: '客户管理',
      key: '/client-list',
      icon: <ShopOutlined />,
      disabled: user?.role !== 1
    },
  ]

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key)
    // navigate(e.key)
  }

  const onClickLogout = () => {
    localStorage.removeItem('user')
    logout()
    navigate('/login')
  }

  useEffect(() => {
    navigate(current)
  }, [current])

  useEffect(() => {
    setCurrent(location.pathname)
  }, [location.pathname])

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h3>呱呱物流管理后台</h3>
        </div>
        <div className='user-info'>
        <Avatar style={{ backgroundColor: '#f56a00', verticalAlign: 'middle', marginRight: '5px' }} size="large" gap={2}>
          {user?.userName}
        </Avatar>
          <a style={{cursor: 'pointer'}} onClick={onClickLogout}>登出</a>
        </div>
      </header>
      <div className='side-bar'>
        <Menu defaultSelectedKeys={['1']} onClick={onClick} selectedKeys={[current]} mode="inline" items={items.filter((it) => it ? ('disabled' in it ? !it.disabled : true) : false)} />
      </div>
      <div className='content'>
        {!location.pathname.includes('waybill-detail') ? (
          <KeepAlive activeName={current} max={10} strategy={'LRU'}>
            {outlet}
          </KeepAlive>
        ) : outlet}
      </div>
    </div>
  )
}

export default App
