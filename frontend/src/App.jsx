import './App.css'
import { Routes, Route } from "react-router-dom"
import { useState } from 'react'
import Temp from './pages/Temp'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import OtpModal from './components/SiteModules/AuthModals/OtpModal'
import ForgetModal from './components/SiteModules/AuthModals/ForgetModal'
import ChangePassModal from './components/SiteModules/AuthModals/ChangePassModal'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Routes>
        <Route path="/" element={ <Temp/> } />
        <Route path="/login" element={ <Login/> } />
        <Route path="/signup" element={ <SignUp/> } />
        <Route path='/otp' element={<OtpModal/>}/>
        <Route path='/forget' element={<ForgetModal/>}/>
        <Route path='/changePass' element={<ChangePassModal/>}/>
      </Routes>
    </>
  )
}

export default App
