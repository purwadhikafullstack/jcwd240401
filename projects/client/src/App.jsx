import axios from "axios";
import logo from "./logo.svg";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from "./page/user/Home";
import AdminHome from "./page/admin/AdminHome";
import SuperAdminManageBranch from "./page/admin/SuperAdminManageBranch";
import SuperAdminManageProduct from "./page/admin/SuperAdminManageProduct";
import SuperAdminManageCategory from "./page/admin/SuperAdminManageCategory";
import SuperAdminReport from "./page/admin/SuperAdminReport";
import SuperAdminOrder from "./page/admin/SuperAdminOrder";
import BranchAdminManageProduct from "./page/admin/BranchAdminManageProduct";
import BranchAdminManagePromotion from "./page/admin/BranchAdminManagePromotion";
import BranchAdminManageOrder from "./page/admin/BranchAdminManageOrder";
import BranchAdminReport from "./page/admin/BranchAdminReport";
import Login from "./page/Login";
import UserRegister from "./page/user/UserRegister";

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/manage-branch" element={<SuperAdminManageBranch />} />
        <Route path="/admin/manage-product" element={<SuperAdminManageProduct />} />
        <Route path="/admin/manage-category" element={<SuperAdminManageCategory />} />
        <Route path="/admin/report" element={<SuperAdminReport />} />
        <Route path="/admin/order" element={<SuperAdminOrder />} />
        <Route path="/admin/branch/manage-product" element={<BranchAdminManageProduct />} />
        <Route path="/admin/branch/manage-promotion" element={<BranchAdminManagePromotion />} />
        <Route path="/admin/branch/manage-order" element={<BranchAdminManageOrder />} />
        <Route path="/admin/branch/report" element={<BranchAdminReport />} />
      </Routes>
    </Router>
  );
}

export default App;
