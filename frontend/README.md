# WeaveHealth HIMS - Frontend

This is the frontend application for the WeaveHealth Hospital Information Management System (HIMS). It provides role-based dashboards, patient management, and comprehensive clinical workflows.

## 🚀 Tech Stack

- **Framework:** [React 19](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Routing:** [React Router DOM](https://reactrouter.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Animations:** [Framer Motion](https://www.framer.com/motion/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **HTTP Client:** [Axios](https://axios-http.com/)
- **Internationalization:** [i18next](https://www.i18next.com/)

## 📂 Project Structure

```text
frontend/
├── public/                # Static assets (favicon, etc.)
└── src/                   # Main application source code
    ├── assets/            # Images, fonts, and local static assets
    ├── components/        # Reusable UI components (common, layout, auth)
    ├── context/           # React Context providers (Auth, Theme)
    ├── data/              # Mock data and constants
    ├── hooks/             # Custom React hooks
    ├── pages/             # Role-specific dashboard views
    │   ├── AdminDashboard.jsx
    │   ├── DoctorDashboard.jsx
    │   ├── PatientDashboard.jsx
    │   ├── ReceptionistDashboard.jsx
    │   └── ...
    ├── services/          # API integration and Axios interceptors
    ├── App.jsx            # Main app component and routing configuration
    └── main.jsx           # React entry point
```

## 🛠️ Setup & Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Copy `.env.example` to `.env` and update the API base URL if necessary.
   ```bash
   cp .env.example .env
   ```

3. **Start Development Server:**
   ```bash
   npm run dev
   ```

4. **Build for Production:**
   ```bash
   npm run build
   ```

5. **Preview Production Build:**
   ```bash
   npm run preview
   ```

## 🔐 Key Features

- **Role-Based Dashboards:** Unique UI and routing for Super Admins, Admins, Doctors, Nurses, Receptionists, Lab Technicians, Pharmacy, Blood Bank, and Patients.
- **Secure Authentication:** JWT-based authentication integrated via Axios interceptors.
- **Responsive Design:** Fully responsive layout built with Tailwind CSS.
- **Dynamic Animations:** Smooth transitions and interactions powered by Framer Motion.
- **Internationalization (i18n):** Multi-language support structure using i18next.

## 📜 Linting & Code Quality

The project uses ESLint for code quality enforcement. Run the linter using:
```bash
npm run lint
```
