import { useState } from 'react'
import './App.css'
import { Routes, Route } from "react-router-dom"
import Temp from './pages/Temp'
import OtpModal from './components/SiteModules/AuthModals/OtpModal'
import ForgetModal from './components/SiteModules/AuthModals/ForgetModal'
import ChangePassModal from './components/SiteModules/AuthModals/ChangePassModal'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Routes>
        <Route path="/" element={ <Temp/> } />
      <Route path='/otp' element={<OtpModal/>}/>
      <Route path='/forget' element={<ForgetModal/>}/>
      <Route path='/changePass' element={<ChangePassModal/>}/>
      </Routes>
    </>
  )
}

export default App
