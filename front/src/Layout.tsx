import './styles/Layout.css'
import axios from 'axios'
import { Outlet } from 'react-router-dom';
import AuthProvider from './auth';

function Layout() {
  axios.defaults.validateStatus = () => true;
  axios.defaults.withCredentials = true;
  axios.defaults.baseURL = "http://localhost:3000";

  return (
    <AuthProvider>
      <main>
        <Outlet />
      </main>
    </AuthProvider>
  )
}

export default Layout
