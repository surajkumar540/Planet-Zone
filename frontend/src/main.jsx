import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store/store.js'
import axios from 'axios'
import { getToken } from './utils/functions.js'
import ProtectedRoute from './components/Provider/ProtectedRoute.jsx'

axios.defaults.baseURL = "https://planet-backend-92ic.onrender.com";
axios.defaults.headers.common[
  "Authorization"
] = `Bearer ${getToken()}`;


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ProtectedRoute>
        <App />
        </ProtectedRoute>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
)
