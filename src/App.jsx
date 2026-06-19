import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Areas from './pages/Areas.jsx';
import Members from './pages/Members.jsx';
import FeePortal from './pages/FeePortal.jsx';
import Reports from './pages/Reports.jsx';
import Zakat from './pages/Zakat.jsx';
import Fitra from './pages/Fitra.jsx';
import Atiya from './pages/Atiya.jsx';

function Protected({ children }) {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/areas" element={<Areas />} />
        <Route path="/members" element={<Members />} />
        <Route path="/fees/:areaId" element={<FeePortal />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/zakat" element={<Zakat />} />
        <Route path="/fitra" element={<Fitra />} />
        <Route path="/atiya" element={<Atiya />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
