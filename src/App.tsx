import { useEffect, useState } from 'react'
import { useOutlet, useNavigate } from 'react-router-dom';
import KeepAlive from 'keepalive-for-react'
import './App.css'
import { Menu, MenuProps } from 'antd';
import { TruckOutlined, UserOutlined } from '@ant-design/icons';

function App() {
  const navigate = useNavigate()
  const outlet = useOutlet()
  type MenuItem = Required<MenuProps>['items'][number];
  const [current, setCurrent] = useState(location.pathname === '/' ? '/waybill-list' :location.pathname)
  const items: MenuItem[] = [
    {
      label: '运单中心',
      key: '/waybill-list',
      icon: <TruckOutlined />,
    },
    {
      label: '用户管理',
      key: '/user-list',
      icon: <UserOutlined />,
    }
  ]

  const onClick: MenuProps['onClick'] = (e) => {
    setCurrent(e.key)
    // navigate(e.key)
  }

  useEffect(() =>  {
    navigate(current)
  },[current])

  return (
    <div className="App">
      <header className="App-header">
        <div>
          <h3>物流管理后台</h3>
        </div>
      </header>
      <div className='side-bar'>
        <Menu onClick={onClick} selectedKeys={[current]} mode="inline" items={items} />
      </div>
      <div className='content'>
        <KeepAlive activeName={current} max={10} strategy={'LRU'}>
          {outlet}
        </KeepAlive>
      </div>
    </div>
  )
}

export default App
