import { useMemo, useEffect, lazy, Suspense, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, CssBaseline, Box, CircularProgress, Typography } from '@mui/material';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import getTheme from './theme';
import { useAuthStore } from './stores/authStore';
import { ThemeProvider as AppThemeProvider, useThemeMode } from './contexts/ThemeContext';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';
import Login from './pages/Login/Login';
import Dashboard from './pages/Dashboard/Dashboard';

const Contractors = lazy(() => import('./pages/Contractors/Contractors'));
const Projects = lazy(() => import('./pages/Projects/Projects'));
const Phases = lazy(() => import('./pages/Phases/Phases'));
const Codes = lazy(() => import('./pages/Codes/Codes'));
const WorkOrders = lazy(() => import('./pages/WorkOrders/WorkOrders'));
const WorkOrderItems = lazy(() => import('./pages/WorkOrderItems/WorkOrderItems'));
const Drawings = lazy(() => import('./pages/Drawings/Drawings'));
const DrawingRevisions = lazy(() => import('./pages/DrawingRevisions/DrawingRevisions'));
const Documents = lazy(() => import('./pages/Documents/Documents'));
const PaymentCertificates = lazy(() => import('./pages/PaymentCertificates/PaymentCertificates'));
const Employees = lazy(() => import('./pages/Employees/Employees'));
const BOQ = lazy(() => import('./pages/BOQ/BOQ'));
const IPC = lazy(() => import('./pages/IPC/IPC'));
const IPCPrint = lazy(() => import('./pages/IPC/IPCPrint'));
const Reports = lazy(() => import('./pages/Reports/Reports'));
const ContractsPage = lazy(() => import('./pages/Contracts/Contracts'));
const DailyReportsPage = lazy(() => import('./pages/DailyReports/DailyReports'));
const SubcontractorsPage = lazy(() => import('./pages/Subcontractors/Subcontractors'));
const SchedulesPage = lazy(() => import('./pages/Schedules/Schedules'));
const VariationOrders = lazy(() => import('./pages/VariationOrders/VariationOrders'));
const RFIs = lazy(() => import('./pages/RFIs/RFIs'));
const MAR = lazy(() => import('./pages/MAR/MAR'));
const NCR = lazy(() => import('./pages/NCR/NCR'));
const Submittals = lazy(() => import('./pages/Submittals/Submittals'));
const InspectionRequests = lazy(() => import('./pages/InspectionRequests/InspectionRequests'));
const PunchList = lazy(() => import('./pages/PunchList/PunchList'));
const Transmittals = lazy(() => import('./pages/Transmittals/Transmittals'));
const MeetingMinutes = lazy(() => import('./pages/MeetingMinutes/MeetingMinutes'));
const EVM = lazy(() => import('./pages/EVM/EVM'));
const CompanyProfile = lazy(() => import('./pages/CompanyProfile/CompanyProfile'));
const Notifications = lazy(() => import('./pages/Notifications/Notifications'));
const Admin = lazy(() => import('./pages/Admin/Admin'));
const SearchPage = lazy(() => import('./pages/Search/Search'));
const ProjectHub = lazy(() => import('./pages/ProjectHub/ProjectHub'));
const Branches = lazy(() => import('./pages/Branches/Branches'));
const Categories = lazy(() => import('./pages/Categories/Categories'));
const CostCodes = lazy(() => import('./pages/CostCodes/CostCodes'));
const SafetyIncidents = lazy(() => import('./pages/SafetyIncidents/SafetyIncidents'));
const SafetyObservations = lazy(() => import('./pages/SafetyObservations/SafetyObservations'));
const HSEDashboard = lazy(() => import('./pages/HSEDashboard/HSEDashboard'));
const MaterialTests = lazy(() => import('./pages/MaterialTests/MaterialTests'));
const ITP = lazy(() => import('./pages/ITP/ITP'));
const MethodStatements = lazy(() => import('./pages/MethodStatements/MethodStatements'));
const Specifications = lazy(() => import('./pages/Specifications/Specifications'));
const Permits = lazy(() => import('./pages/Permits/Permits'));
const Survey = lazy(() => import('./pages/Survey/Survey'));

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.15, ease: 'easeIn' } },
};

const MotionOutlet = ({ children }: { children: ReactNode }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

function ProtectedRoute({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
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
  const initialize = useAuthStore((s) => s.initialize);
  const theme = useMemo(() => getTheme(i18n.language, mode), [i18n.language, mode]);

  useEffect(() => { initialize(); }, [initialize]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
      <Suspense fallback={<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}><CircularProgress size={40} sx={{ color: '#D97706' }} /></Box>}>
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
      </Suspense>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}
