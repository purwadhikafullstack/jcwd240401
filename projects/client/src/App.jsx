import axios from "axios";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import jwtDecode from "jwt-decode";
import { useDispatch } from "react-redux";
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
import BranchAdminSetAccount from "./page/admin/BranchAdminSetAccount";
import PrivateSuperAdminWrapper from "./wrapper/PrivateSuperAdminWrapper";
import PrivateAdminWrapper from "./wrapper/PrivateAdminWrapper";
import PrivateBranchAdminWrapper from "./wrapper/PrivateBranchAdminWrapper";
import Unauthorized from "./page/Unauthorized";
import { keep } from "./store/reducer/authSlice";
import NotFound from "./page/NotFound";

function App() {
  const dispatch = useDispatch()

  const keepLogin = async () => {
    let token = localStorage.getItem("token")
    if(token) {
      try {
        const response = await axios.get("http://localhost:8000/api/auth/keep-login", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        })

        if(response.data.userId){
          localStorage.setItem("token", response.data.refreshToken)
          const decoded = jwtDecode(token)
          dispatch(keep(decoded))
        }
      }catch(error){
        console.log(error)
      }
    }
  }

  useEffect(() => {
    keepLogin()
  },[])

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/set-password/:verificationToken" element={<BranchAdminSetAccount />} />

        <Route element={<PrivateAdminWrapper allowedRoles={[1,2]} />}>
          <Route path="/admin" element={<AdminHome />} />
        </Route>

        <Route element={<PrivateAdminWrapper allowedRoles={[1]}/>}>
          <Route path="/admin/manage-branch" element={<SuperAdminManageBranch />} />
          <Route path="/admin/manage-product" element={<SuperAdminManageProduct />} />
          <Route path="/admin/manage-category" element={<SuperAdminManageCategory />} />
          <Route path="/admin/report" element={<SuperAdminReport />} />
          <Route path="/admin/order" element={<SuperAdminOrder />} />
        </Route>

        <Route element={<PrivateAdminWrapper allowedRoles={[2]}/>}>
          <Route path="/admin/branch/manage-product" element={<BranchAdminManageProduct />} />
          <Route path="/admin/branch/manage-promotion" element={<BranchAdminManagePromotion />} />
          <Route path="/admin/branch/manage-order" element={<BranchAdminManageOrder />} />
          <Route path="/admin/branch/report" element={<BranchAdminReport />} />
        </Route>
        
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
