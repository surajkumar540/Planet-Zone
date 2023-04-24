import './App.css'
import { Routes, Route } from "react-router-dom"
import Temp from './pages/Temp'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import OtpVerify from './pages/OtpVerify'

function App() {

  return (
    <>
       <Routes>
        <Route path="/" element={ <Temp/> } />
        <Route path="/login" element={ <Login/> } />
        <Route path="/signup" element={ <SignUp/> } />
        <Route path="/otp" element={ <OtpVerify/> } />
      </Routes>
    </>
  )
}

export default App
