import React from 'react';

// Sample data for demonstration
const patients = [
  { name: 'Beth Mccoy', status: 'On Going', time: '' },
  { name: 'Evan Henry', status: '', time: '12:00' },
  { name: 'Dwight Murphy', status: '', time: '14:00' },
  { name: 'Bessie Alexander', status: '', time: '14:00' },
];

const DoctorsDashboard = () => {
  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <div style={styles.profile}>
          <img src="https://via.placeholder.com/50" alt="Doctor" style={styles.profileImage} />
          <h3>Dr. Stranger</h3>
          <p>Dentist</p>
        </div>
        <nav style={styles.nav}>
          <ul>
            <li>Dashboard</li>
            <li>Schedule</li>
            <li>Patients</li>
            <li>Messages</li>
            <li>Medicines</li>
          </ul>
        </nav>
        <button style={styles.logoutButton}>Logout</button>
      </aside>

      <main style={styles.main}>
        <header style={styles.header}>
          <h2>Dashboard</h2>
          <div style={styles.stats}>
            <div style={styles.statCard}>
              <p>Patients</p>
              <h3>666</h3>
            </div>
            <div style={styles.statCard}>
              <p>Income</p>
              <h3>$2,111</h3>
            </div>
            <div style={styles.statCard}>
              <p>Appointments</p>
              <h3>211</h3>
            </div>
            <div style={styles.statCard}>
              <p>Treatments</p>
              <h3>402</h3>
            </div>
          </div>
        </header>

        <section style={styles.appointments}>
          <div style={styles.todayAppointments}>
            <h3>Today Appointment</h3>
            <ul>
              {patients.map((patient, index) => (
                <li key={index} style={styles.appointmentItem}>
                  <p>{patient.name}</p>
                  <span>{patient.status || patient.time}</span>
                </li>
              ))}
            </ul>
          </div>

          <div style={styles.nextPatientDetails}>
            <h3>Next Patient Details</h3>
            <p><strong>Beth Mccoy</strong></p>
            <p>Address: 2235 Avondale Ave Pasadena, Oklahoma 83900</p>
            <p>D.O.B: 29 February 1999</p>
            <p>Sex: Female</p>
            <p>Weight: 56 kg</p>
            <p>Height: 172 cm</p>
            <p>Last Appointment: 02 Jan 2020</p>
            <p>Register Date: 19 Dec 2018</p>
            <div style={styles.tags}>
              <span>Asthma</span>
              <span>Hypertension</span>
              <span>Asam Urat</span>
            </div>
            <button style={styles.contactButton}>(308) 555-0121</button>
          </div>
        </section>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
  },
  sidebar: {
    width: '250px',
    backgroundColor: '#2C3E50',
    color: '#ECF0F1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  profile: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  profileImage: {
    borderRadius: '50%',
    marginBottom: '10px',
  },
  nav: {
    flexGrow: 1,
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: '#E74C3C',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  main: {
    flexGrow: 1,
    padding: '20px',
    backgroundColor: '#ECF0F1',
  },
  header: {
    marginBottom: '20px',
  },
  stats: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  statCard: {
    padding: '10px 20px',
    backgroundColor: '#fff',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  appointments: {
    display: 'flex',
    justifyContent: 'space-between',
  },
  todayAppointments: {
    flex: '1',
    marginRight: '20px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  appointmentItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #ddd',
  },
  nextPatientDetails: {
    flex: '1',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  tags: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  contactButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#3498DB',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
};

export default DoctorsDashboard;
