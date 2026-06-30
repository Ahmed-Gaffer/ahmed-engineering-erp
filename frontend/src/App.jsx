import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import getTheme from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider as AppThemeProvider, useThemeMode } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
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
import Employees from './pages/Employees/Employees';
import BOQ from './pages/BOQ/BOQ';
import IPC from './pages/IPC/IPC';
import IPCPrint from './pages/IPC/IPCPrint';
import Reports from './pages/Reports/Reports';
import ContractsPage from './pages/Contracts/Contracts';
import DailyReportsPage from './pages/DailyReports/DailyReports';
import SubcontractorsPage from './pages/Subcontractors/Subcontractors';
import SchedulesPage from './pages/Schedules/Schedules';
import VariationOrders from './pages/VariationOrders/VariationOrders';
import RFIs from './pages/RFIs/RFIs';
import MAR from './pages/MAR/MAR';
import NCR from './pages/NCR/NCR';
import Submittals from './pages/Submittals/Submittals';
import InspectionRequests from './pages/InspectionRequests/InspectionRequests';
import PunchList from './pages/PunchList/PunchList';
import Transmittals from './pages/Transmittals/Transmittals';
import MeetingMinutes from './pages/MeetingMinutes/MeetingMinutes';
import EVM from './pages/EVM/EVM';
import CompanyProfile from './pages/CompanyProfile/CompanyProfile';
import Notifications from './pages/Notifications/Notifications';
import Admin from './pages/Admin/Admin';
import SearchPage from './pages/Search/Search';
import ProjectHub from './pages/ProjectHub/ProjectHub';
import Branches from './pages/Branches/Branches';
import Categories from './pages/Categories/Categories';
import CostCodes from './pages/CostCodes/CostCodes';
import SafetyIncidents from './pages/SafetyIncidents/SafetyIncidents';
import SafetyObservations from './pages/SafetyObservations/SafetyObservations';
import HSEDashboard from './pages/HSEDashboard/HSEDashboard';
import MaterialTests from './pages/MaterialTests/MaterialTests';
import ITP from './pages/ITP/ITP';
import MethodStatements from './pages/MethodStatements/MethodStatements';
import Specifications from './pages/Specifications/Specifications';
import Permits from './pages/Permits/Permits';
import Survey from './pages/Survey/Survey';

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
  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', bgcolor: 'background.default' }}>
        <Box textAlign="center">
          <CircularProgress size={48} sx={{ color: '#D97706' }} />
          <Typography variant="body2" color="text.secondary" mt={2}>Loading...</Typography>
        </Box>
      </Box>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
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
      <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/login" element={<MotionOutlet><Login /></MotionOutlet>} />
          <Route path="engineering/ipc/:ipcId/print" element={<MotionOutlet><IPCPrint /></MotionOutlet>} />
          <Route path="/engineering" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<MotionOutlet><Dashboard /></MotionOutlet>} />
            <Route path="contractors" element={<MotionOutlet><Contractors /></MotionOutlet>} />
            <Route path="projects/:projectId" element={<MotionOutlet><ProjectHub /></MotionOutlet>} />
            <Route path="projects" element={<MotionOutlet><Projects /></MotionOutlet>} />
            <Route path="phases" element={<MotionOutlet><Phases /></MotionOutlet>} />
            <Route path="codes" element={<MotionOutlet><Codes /></MotionOutlet>} />
            <Route path="work-orders" element={<MotionOutlet><WorkOrders /></MotionOutlet>} />
            <Route path="work-order-items" element={<MotionOutlet><WorkOrderItems /></MotionOutlet>} />
            <Route path="drawings" element={<MotionOutlet><Drawings /></MotionOutlet>} />
            <Route path="drawing-revisions" element={<MotionOutlet><DrawingRevisions /></MotionOutlet>} />
            <Route path="documents" element={<MotionOutlet><Documents /></MotionOutlet>} />
            <Route path="payment-certificates" element={<MotionOutlet><PaymentCertificates /></MotionOutlet>} />
            <Route path="boq" element={<MotionOutlet><BOQ /></MotionOutlet>} />
            <Route path="ipc" element={<MotionOutlet><IPC /></MotionOutlet>} />
            <Route path="reports" element={<MotionOutlet><Reports /></MotionOutlet>} />
            <Route path="contracts-list" element={<MotionOutlet><ContractsPage /></MotionOutlet>} />
            <Route path="daily-reports" element={<MotionOutlet><DailyReportsPage /></MotionOutlet>} />
            <Route path="subcontractors" element={<MotionOutlet><SubcontractorsPage /></MotionOutlet>} />
            <Route path="schedules" element={<MotionOutlet><SchedulesPage /></MotionOutlet>} />
            <Route path="variation-orders" element={<MotionOutlet><VariationOrders /></MotionOutlet>} />
            <Route path="rfis" element={<MotionOutlet><RFIs /></MotionOutlet>} />
            <Route path="mar" element={<MotionOutlet><MAR /></MotionOutlet>} />
            <Route path="ncr" element={<MotionOutlet><NCR /></MotionOutlet>} />
            <Route path="submittals" element={<MotionOutlet><Submittals /></MotionOutlet>} />
            <Route path="inspection-requests" element={<MotionOutlet><InspectionRequests /></MotionOutlet>} />
            <Route path="punch-list" element={<MotionOutlet><PunchList /></MotionOutlet>} />
            <Route path="transmittals" element={<MotionOutlet><Transmittals /></MotionOutlet>} />
            <Route path="projects/:projectId/meeting-minutes" element={<MotionOutlet><MeetingMinutes /></MotionOutlet>} />
            <Route path="evm" element={<MotionOutlet><EVM /></MotionOutlet>} />
            <Route path="employees" element={<MotionOutlet><Employees /></MotionOutlet>} />
            <Route path="company-profile" element={<MotionOutlet><CompanyProfile /></MotionOutlet>} />
            <Route path="notifications" element={<MotionOutlet><Notifications /></MotionOutlet>} />
            <Route path="admin" element={<MotionOutlet><Admin /></MotionOutlet>} />
            <Route path="branches" element={<MotionOutlet><Branches /></MotionOutlet>} />
            <Route path="categories" element={<MotionOutlet><Categories /></MotionOutlet>} />
            <Route path="cost-codes" element={<MotionOutlet><CostCodes /></MotionOutlet>} />
            <Route path="safety-incidents" element={<MotionOutlet><SafetyIncidents /></MotionOutlet>} />
            <Route path="safety-observations" element={<MotionOutlet><SafetyObservations /></MotionOutlet>} />
            <Route path="hse/dashboard" element={<MotionOutlet><HSEDashboard /></MotionOutlet>} />
            <Route path="material-tests" element={<MotionOutlet><MaterialTests /></MotionOutlet>} />
            <Route path="itps" element={<MotionOutlet><ITP /></MotionOutlet>} />
            <Route path="method-statements" element={<MotionOutlet><MethodStatements /></MotionOutlet>} />
            <Route path="specifications" element={<MotionOutlet><Specifications /></MotionOutlet>} />
            <Route path="permits" element={<MotionOutlet><Permits /></MotionOutlet>} />
            <Route path="survey" element={<MotionOutlet><Survey /></MotionOutlet>} />
            <Route path="search" element={<MotionOutlet><SearchPage /></MotionOutlet>} />
          </Route>
          <Route path="*" element={<Navigate to="/engineering/dashboard" replace />} />
        </Routes>
      </AnimatePresence>
      </ErrorBoundary>
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
