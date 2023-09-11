import axios from "axios";
import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import PrivateAdminWrapper from "./wrapper/PrivateAdminWrapper";
import PublicWrapper from "./wrapper/PublicWrapper";
import Unauthorized from "./page/Unauthorized";
import { keep } from "./store/reducer/authSlice";
import NotFound from "./page/NotFound";
import ForgotPassword from "./page/ForgotPassword";
import VerifyAccount from "./page/user/VerifyAccount";
import ResetPassword from "./page/ResetPassword";
import Cart from "./page/user/Cart";
import Checkout from "./page/user/Checkout";
import Payment from "./page/user/Payment";
import Orders from "./page/user/Orders";
import Account from "./page/user/Account";
import UserProfile from "./page/user/UserProfile";
import UserProfileEdit from "./page/user/UserProfileEdit";
import UserProfileChangePassword from "./page/user/UserProfileChangePassword";
import UserAddressCreate from "./page/user/UserAddressCreate";
import UserAddressModify from "./page/user/UserAddressModify";
import UserAddress from "./page/user/UserAddress";
import SingleProduct from "./page/user/SingleProduct";
import { updateCart } from "./store/reducer/cartSlice";
import BranchAdminModifyBranchProduct from "./component/admin/BranchAdminModifyBranchProduct";
import SuperAdminModifyCategory from "./component/admin/SuperAdminModifyCategory";
import SuperAdminModifyProduct from "./component/admin/SuperAdminModifyProduct";
import { keepLocation } from "./store/reducer/locationSlice";


function App() {
  const dispatch = useDispatch();

  const keepLogin = async () => {
    let token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/auth/keep-login",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.userId) {
          localStorage.setItem("token", response.data.refreshToken);
          const decoded = jwtDecode(token);
          dispatch(keep(decoded));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const userCart = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/users/carts`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        dispatch(updateCart(response.data.data));
      } catch (error) {
        console.log(error);
      }
    }
  };

  const userLocation = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        dispatch(keepLocation("false"));
      } catch (error) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    keepLogin();
    userCart();
    userLocation();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<PublicWrapper />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<UserRegister />} />
          <Route
            path="/verify-account/:verificationToken"
            element={<VerifyAccount />}
          />
          <Route
            path="/set-password/:verificationToken"
            element={<BranchAdminSetAccount />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/reset-password/:resetPasswordToken"
            element={<ResetPassword />}
          />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<PrivateAdminWrapper allowedRoles={[1, 2]} />}>
          <Route path="/admin" element={<AdminHome />} />
        </Route>

        <Route element={<PrivateAdminWrapper allowedRoles={[1]} />}>
          <Route
            path="/admin/manage-branch"
            element={<SuperAdminManageBranch />}
          />
          <Route
            path="/admin/manage-product"
            element={<SuperAdminManageProduct />}
          />
          <Route
            path="/admin/manage-category"
            element={<SuperAdminManageCategory />}
          />
          <Route path="/admin/report" element={<SuperAdminReport />} />
          <Route path="/admin/order" element={<SuperAdminOrder />} />
        </Route>

        <Route element={<PrivateAdminWrapper allowedRoles={[2]} />}>
          <Route
            path="/admin/branch/manage-product"
            element={<BranchAdminManageProduct />}
          />
          <Route
            path="/admin/branch/manage-promotion"
            element={<BranchAdminManagePromotion />}
          />
          <Route
            path="/admin/branch/manage-order"
            element={<BranchAdminManageOrder />}
          />
          <Route path="/admin/branch/report" element={<BranchAdminReport />} />
        </Route>

        <Route path="/user/cart" element={<Cart />} />
        <Route path="/user/checkout" element={<Checkout />} />
        <Route path="/user/payment" element={<Payment />} />
        <Route path="/user/orders" element={<Orders />} />
        <Route path="/user/account" element={<Account />} />
        <Route path="/user/account/my-profile" element={<UserProfile />} />
        <Route
          path="/user/account/my-profile/modify"
          element={<UserProfileEdit />}
        />
        <Route
          path="/user/account/my-profile/change-password"
          element={<UserProfileChangePassword />}
        />
        <Route path="/user/account/my-address" element={<UserAddress />} />
        <Route
          path="/user/account/my-address/create"
          element={<UserAddressCreate />}
        />
        <Route path="/user/account/my-address/modify/:name" element={<UserAddressModify />} />
        <Route path="/product/:branchId/:name/:weight/:unitOfMeasurement" element={<SingleProduct />} />
        <Route path="/admin/branch/manage-product/branch-product/:id/modify" element={<BranchAdminModifyBranchProduct />} />
        <Route path="/admin/manage-category/category/:id/modify" element={<SuperAdminModifyCategory />} />
        <Route path="/admin/manage-product/product/:id/modify" element={<SuperAdminModifyProduct />} />
        <Route path="/*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
