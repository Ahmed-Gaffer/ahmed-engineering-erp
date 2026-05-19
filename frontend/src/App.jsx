import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import getTheme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider as AppThemeProvider, useThemeMode } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';
import Contractors from './pages/Contractors/Contractors';
import Projects from './pages/Projects/Projects';
import Phases from './pages/Phases/Phases';
import Codes from './pages/Codes/Codes';
import WorkOrders from './pages/WorkOrders/WorkOrders';
import WorkOrderItems from './pages/WorkOrderItems/WorkOrderItems';
import Drawings from './pages/Drawings/Drawings';
import DrawingRevisions from './pages/DrawingRevisions/DrawingRevisions';
import Documents from './pages/Documents/Documents';
import PaymentCertificates from './pages/PaymentCertificates/PaymentCertificates';

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

const MotionOutlet = ({ children }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const prev = useRef();
  if (loading) return null;
  if (!user) {
    prev.current = null;
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppContent() {
  const { i18n } = useTranslation();
  const { mode } = useThemeMode();
  const location = useLocation();
  const theme = useMemo(() => getTheme(i18n.language, mode), [i18n.language, mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<MotionOutlet><Login /></MotionOutlet>} />
          <Route path="/engineering" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MotionOutlet><Dashboard /></MotionOutlet>} />
            <Route path="contractors" element={<MotionOutlet><Contractors /></MotionOutlet>} />
            <Route path="projects" element={<MotionOutlet><Projects /></MotionOutlet>} />
            <Route path="phases" element={<MotionOutlet><Phases /></MotionOutlet>} />
            <Route path="codes" element={<MotionOutlet><Codes /></MotionOutlet>} />
            <Route path="work-orders" element={<MotionOutlet><WorkOrders /></MotionOutlet>} />
            <Route path="work-order-items" element={<MotionOutlet><WorkOrderItems /></MotionOutlet>} />
            <Route path="drawings" element={<MotionOutlet><Drawings /></MotionOutlet>} />
            <Route path="drawing-revisions" element={<MotionOutlet><DrawingRevisions /></MotionOutlet>} />
            <Route path="documents" element={<MotionOutlet><Documents /></MotionOutlet>} />
            <Route path="payment-certificates" element={<MotionOutlet><PaymentCertificates /></MotionOutlet>} />
          </Route>
          <Route path="*" element={<Navigate to="/engineering/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppThemeProvider>
        <AppContent />
      </AppThemeProvider>
    </AuthProvider>
  );
}
