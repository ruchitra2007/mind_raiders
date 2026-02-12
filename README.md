# MedFlow Clinic — Real-Time Hospital Workflow Management System

## Project Overview

MedFlow Clinic is a real-time hospital workflow management platform designed to streamline coordination between reception, doctors, laboratories, and pharmacies. The system centralizes all clinical actions around a single patient encounter, enabling transparent tracking of patient care from registration to completion.

The platform addresses common operational challenges in healthcare environments such as fragmented communication, delayed task handling, and lack of real-time visibility. By organizing workflows into structured department queues and synchronized updates, MedFlow Clinic improves efficiency and reduces coordination delays.

---

## Key Features

- Centralized patient registration with token-based encounter system  
- Department-based doctor assignment  
- Role-specific dashboards (Reception, Doctor, Lab, Pharmacy)  
- Real-time task queues with live status tracking  
- Automated patient activity timeline  
- Lab reporting workflow integrated with doctor review  
- Secure relational database with Row Level Security (RLS)

---

## Tech Stack

### Frontend

- React  
- TypeScript  
- Tailwind CSS  
- Lucide Icons  

### Backend

- Supabase (PostgreSQL database + REST API)  
- Supabase Realtime subscriptions  

### Database & Security

- PostgreSQL (via Supabase)  
- Row Level Security (RLS) policies  
- Relational schema with foreign key constraints  

### Development & Collaboration

- Google AI Studio (AI-assisted development)  
- GitHub (version control and repository hosting)

---

## System Architecture Summary

The system follows a modular client–server architecture:

Reception → Department Selection → Doctor Assignment →  
Lab/Pharmacy Processing → Timeline Updates → Completion

Frontend dashboards communicate with Supabase in real time, ensuring synchronized updates across departments.

---

## Project Directory Structure

```
medflow-clinic/
│
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/           # Reception, Doctor, Lab, Pharmacy views
│   ├── lib/             # Supabase configuration
│   ├── types/           # TypeScript interfaces
│   └── main.tsx
│
├── docs/                # Architecture diagrams and documentation
├── assets/              # Images and presentation assets
├── public/              # Static files
│
├── README.md
├── package.json
├── tailwind.config.js
└── vite.config.ts
```

---

## Installation and Setup

### Prerequisites

- Node.js (v18 or later recommended)  
- npm or yarn  
- Supabase account  

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/medflow-clinic.git
cd medflow-clinic
```

### Step 2 — Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

### Step 3 — Configure Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

These values are available in:

Supabase Dashboard → Project Settings → API

### Step 4 — Run the Development Server

```bash
npm run dev
```

The application will be available at:

```
http://localhost:5173
```

---

## Usage Guide

1. Register a patient through the Reception dashboard  
2. Select department and assign a doctor  
3. Create clinical tasks from the Doctor dashboard  
4. Process tasks in Lab and Pharmacy queues  
5. Monitor real-time updates in the Timeline view  

---

## Security Considerations

- Row Level Security enabled on database tables  
- Controlled read/write access policies  
- Relational integrity enforced via foreign keys  

---

## Future Enhancements

- AI-assisted clinical recommendations  
- Advanced analytics dashboard  
- Multi-clinic scalability  
- Electronic medical record integration  

---

## Team

Developed as part of the Vibe Coding Hackathon.

Team members: 
Mohammed Zayd AbdurRahman
Ruchitra Jangala
Ishanth Kulkarni
Sravani Madisetty

---

## License

This project is intended for educational and hackathon purposes.

---

## Acknowledgements

- Supabase for backend infrastructure  
- Google AI Studio for development assistance  
- Open-source React ecosystem




