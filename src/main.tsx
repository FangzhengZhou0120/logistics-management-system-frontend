import { Fragment } from 'react';
import { createRoot } from 'react-dom/client'
import './index.css'
import { RouterProvider } from 'react-router-dom';
import router from './router';

createRoot(document.getElementById('root')!).render(
  <Fragment>
    <RouterProvider router={router} />
  </Fragment>
)
