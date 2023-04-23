import './App.css'
import { Routes, Route } from "react-router-dom"
import { useState } from 'react'
import Temp from './pages/Temp'
import Login from './pages/Login'
import SignUp from './pages/SignUp'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Routes>
        <Route path="/" element={ <Temp/> } />
        <Route path="/login" element={ <Login/> } />
        <Route path="/signup" element={ <SignUp/> } />

      </Routes>
    </>
  )
}

export default App
