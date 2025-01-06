import {
    createBrowserRouter
} from "react-router-dom";
import App from './App';
import { WaybillManagement } from "./view/waybill-management/waybill-management";
import { UserManagement } from "./view/user-management/user-management";
import { WaybillDetail } from "./view/waybill-detail/waybill-detail";
import { Login } from "./view/login/login";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App />,
        children: [
            {
                path: "login",
                element: <Login />
            },
            {
                path:"waybill-list",
                element: <WaybillManagement />
            },
            {
                path:"user-list",
                element: <UserManagement />
            },
            {
                path:"waybill-detail",
                element: <WaybillDetail />
            }
        ]
    }
]);

export default router;