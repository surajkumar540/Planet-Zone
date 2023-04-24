import './App.css'
import { Routes, Route } from "react-router-dom"
import Temp from './pages/Temp'
import Login from './pages/Login'
import SignUp from './pages/SignUp'

function App() {

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
