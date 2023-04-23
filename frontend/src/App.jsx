import { useState } from 'react'
import './App.css'
import { Routes, Route } from "react-router-dom"
import Temp from './pages/Temp'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
       <Routes>
        <Route path="/" element={ <Temp/> } />
      </Routes>
    </>
  )
}

export default App
