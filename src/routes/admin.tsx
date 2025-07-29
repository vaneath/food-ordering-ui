import { RouteObject } from "react-router-dom";
import { lazy } from 'react';

// Lazy load admin components
const AdminLayout = lazy(() => import("@/pages/admin/layout"));
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const MenuManagement = lazy(() => import("@/pages/admin/menu/MenuManagement"));

// Define admin routes
export const adminRoutes: RouteObject[] = [
  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "menu",
        element: <MenuManagement />,
      },
      // Add more admin routes here
      // {
      //   path: "orders",
      //   element: <Orders />,
      // },
      // {
      //   path: "customers",
      //   element: <Customers />,
      // },
      // {
      //   path: "analytics",
      //   element: <Analytics />,
      // },
      // {
      //   path: "settings",
      //   element: <Settings />,
      // },
    ],
  },
  {
    path: "*",
    element: <div>Admin route not found</div>,
  },
];
