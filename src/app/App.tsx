import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import OnboardingFlowConnected from './components/OnboardingFlowConnected';
import SetupWithCode from './components/SetupWithCode';
import JoinClinicWithCode from './components/JoinClinicWithCode';
import ClinicHome from './components/ClinicHome';
import StaffManagement from './components/StaffManagement';
import PatientLookup from './components/PatientLookup';
import AddPatient from './components/AddPatient';
import PatientContextView from './components/PatientContextView';
import VisitScreen from './components/VisitScreen';
import MigrateFiles from './components/MigrateFiles';
import PatientFiles from './components/PatientFiles';
import Appointments from './components/Appointments';
import PrescriptionManagement from './components/PrescriptionManagement';
import LabResults from './components/LabResults';
import TeamChat from './components/TeamChat';
import SmartAlerts from './components/SmartAlerts';
import Billing from './components/Billing';
import Analytics from './components/Analytics';
import CheckInDesk from './components/CheckInDesk';
import DoctorQueue from './components/DoctorQueue';
import QueueDisplayBoard from './components/QueueDisplayBoard';
import QueueManagement from './components/QueueManagement';
import MobileHome from './components/mobile/MobileHome';
import EmergencyProfile from './components/mobile/EmergencyProfile';
import ClinicsNearby from './components/mobile/ClinicsNearby';
import Prescriptions from './components/mobile/Prescriptions';

export default function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<OnboardingFlowConnected />} />
          <Route path="/setup" element={<SetupWithCode />} />
          <Route path="/join" element={<JoinClinicWithCode />} />
          <Route path="/clinic" element={<ClinicHome />} />
          <Route path="/staff" element={<StaffManagement />} />
        <Route path="/patient-lookup" element={<PatientLookup />} />
        <Route path="/add-patient" element={<AddPatient />} />
        <Route path="/patient/:id" element={<PatientContextView />} />
        <Route path="/visit/:patientId" element={<VisitScreen />} />
        <Route path="/migrate-files" element={<MigrateFiles />} />
        <Route path="/patient-files" element={<PatientFiles />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/prescriptions" element={<PrescriptionManagement />} />
        <Route path="/lab-results" element={<LabResults />} />
        <Route path="/team-chat" element={<TeamChat />} />
        <Route path="/alerts" element={<SmartAlerts />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/check-in" element={<CheckInDesk />} />
        <Route path="/queue" element={<QueueManagement />} />
        <Route path="/doctor-queue" element={<DoctorQueue />} />
        <Route path="/queue-display" element={<QueueDisplayBoard />} />

        {/* Mobile Routes */}
        <Route path="/mobile" element={<MobileHome />} />
        <Route path="/mobile/emergency" element={<EmergencyProfile />} />
        <Route path="/mobile/clinics" element={<ClinicsNearby />} />
        <Route path="/mobile/prescriptions" element={<Prescriptions />} />
      </Routes>
    </Router>
    </>
  );
}
