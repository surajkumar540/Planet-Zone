import React from 'react'
import { Routes,Route } from 'react-router-dom'
import Login from '../../pages/Login'
import SignUp from '../../pages/SignUp'
import OtpVerify from '../../pages/OtpVerify'
import ChangePassword from '../../pages/ChangePassword'
import Header from '../Header/Header'

const AuthRoutes = () => {
  return (
    <>
    <Routes>  
      <Route path="/login" element={ <Login/> } />
      <Route path="/signup" element={ <SignUp/> } />
      <Route path="/otp" element={ <OtpVerify/> } />
      <Route path="/change-password" element={ <ChangePassword/> } />
      <Route path="/cart" element={ <Cart/> } /> 
    </Routes>
    </>
  )
}

export default AuthRoutes