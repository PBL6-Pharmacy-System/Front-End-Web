import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store'
import App1 from './App1.jsx'
import { ToastProvider } from './components/Toast.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <ToastProvider>
      <App1 />
    </ToastProvider>
  </Provider>,
)
