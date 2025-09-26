import {
  FaTachometerAlt,
  FaUsers,
  FaBox,
  FaClipboardList,
  FaFileAlt,
  FaCashRegister,
  FaHistory,
  FaUserEdit,
  FaTruck,
} from "react-icons/fa";

const menuConfig = {
  employer: [
    { label: "Dashboard", path: "/employer/dashboard", icon: FaTachometerAlt },
    {
      label: "Sales Overview",
      path: "/employer/sales-overview",
      icon: FaClipboardList,
    },
    {
      label: "Credit Management",
      path: "/employer/credit",
      icon: FaCashRegister,
    },
    { label: "Employees", path: "/employer/employees", icon: FaUsers },
    { label: "Products & Categories", path: "/employer/products", icon: FaBox },
    {
      label: "Suppliers & Payments",
      path: "/employer/suppliers",
      icon: FaTruck,
    },
    { label: "Reports", path: "/employer/reports", icon: FaFileAlt },
  ],

  manager: [
    { label: "Dashboard", path: "/manager/dashboard", icon: FaTachometerAlt },
    {
      label: "Credit Management",
      path: "/manager/credit",
      icon: FaCashRegister,
    },
    { label: "Employees", path: "/manager/employees", icon: FaUsers },
    { label: "Products & Categories", path: "/manager/products", icon: FaBox },
    {
      label: "Suppliers & Payments",
      path: "/manager/suppliers",
      icon: FaTruck,
    },
    { label: "Day Control", path: "/manager/day-ops", icon: FaClipboardList },
    { label: "Reports", path: "/manager/reports", icon: FaFileAlt },
  ],

  employee: [
    { label: "Dashboard", path: "/employee/dashboard", icon: FaTachometerAlt },
    { label: "New Sale", path: "/employee/new-sale", icon: FaClipboardList },
    {
      label: "Pending Bills",
      path: "/employee/pending-bills",
      icon: FaCashRegister,
    },
    {
      label: "My Sales History",
      path: "/employee/sales-history",
      icon: FaHistory,
    },
  ],
};

export default menuConfig;
