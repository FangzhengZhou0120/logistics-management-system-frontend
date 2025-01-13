import {
    createBrowserRouter
} from "react-router-dom";
import App from './App';
import { WaybillManagement } from "./view/waybill-management/waybill-management";
import { UserManagement } from "./view/user-management/user-management";
import { WaybillDetail } from "./view/waybill-detail/waybill-detail";
import { Login } from "./view/login/login";
import { AuthProvider } from "./context/user-context";
import { AuthGuard } from "./component/auth-guard/auth-guard";

const router = createBrowserRouter([
    {
        path: "/",
        element:
            <AuthProvider>
                <App />
            </AuthProvider>,
        children: [

            {
                path: "waybill-list",
                element: <AuthGuard><WaybillManagement /></AuthGuard>
            },
            {
                path: "user-list",
                element: <AuthGuard><UserManagement /></AuthGuard>
            },
            {
                path: "waybill-detail/:id",
                element: <AuthGuard><WaybillDetail /></AuthGuard>
            }
        ]
    },
    {
        path: "login",
        element:
            <AuthProvider>
                <Login />
            </AuthProvider>
    },
]);

export default router;