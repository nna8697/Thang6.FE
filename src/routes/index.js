// import { Menu } from "antd";
import LayoutDefault from "../layout/LayoutDefault";
import Dashboard from "../pages/Dashboard";
import Invoice from "../pages/Invoice";
import Menu from "../pages/Menu";
import Order from "../pages/Order";
import Categories from "../pages/Categories";
import Login from "../pages/Login";
import Logout from "../pages/Logout";
import Account from "../pages/Account";
import TimeSheet from "../pages/TimeSheet";
import Timekeeping from "../pages/Timekeeping";
import IngredientManager from "../pages/IngredientManager";
import ToolManager from "../pages/ToolManager";
import WarehouseManager from "../pages/WarehouseManager";

export const routes = [
    {
        path: "/Login",
        element: <Login />,
    },
    {
        path: "/",
        element: <LayoutDefault />,
        children: [
            {
                path: "/",
                element: <Dashboard />,
            },
            {
                path: "logout",
                element: <Logout />
            },
            {
                path: "/Menu",
                element: <Menu />,
            },
            {
                path: "/Categories",
                element: <Categories />,
            },
            {
                path: "/Invoice",
                element: <Invoice />,
            },
            {
                path: "/Order",
                element: <Order />,
            },
            {
                path: "/Account",
                element: <Account />,
            },
            // {
            //     path: "/TimeSheet",
            //     element: <TimeSheet />,
            // },
            {
                path: "/Timekeeping",
                element: <Timekeeping />,
            },
            {
                path: "/IngredientManager",
                element: <IngredientManager />,
            },
            {
                path: "/ToolManager",
                element: <ToolManager />,
            },
            {
                path: "/WarehouseManager",
                element: <WarehouseManager />,
            },
        ]
    }
];