

\# MedFlow Clinic  

\### Real-Time Patient Workflow Management System



MedFlow Clinic is a real-time hospital workflow management system designed to eliminate fragmented communication between reception, doctors, laboratories, and pharmacies.



The platform centralizes all clinical actions around a single patient encounter, ensuring transparency, efficiency, and synchronized operations across departments.



---



\## Problem Statement



Hospitals and clinics frequently face:



\- Manual handling of patient tasks and coordination

\- No real-time visibility of patient status

\- Delays between departments (Reception → Doctor → Lab → Pharmacy)

\- Scattered patient information across systems

\- Lack of centralized workflow tracking



These inefficiencies lead to longer waiting times and operational confusion.



---



\## Proposed Solution



MedFlow Clinic introduces a structured, real-time workflow system that:



\- Registers patients with department selection

\- Dynamically assigns available doctors within a department

\- Manages department-wise task queues

\- Sends lab test results directly to doctors

\- Tracks every action in a live patient timeline

\- Synchronizes all updates in real time



The system ensures a transparent and seamless clinical journey from consultation to completion.



---



\## Core Features



\- Department-based doctor assignment  

\- Dynamic doctor availability filtering  

\- Real-time task management  

\- Lab-to-doctor report flow (Positive / Negative reports)  

\- Centralized patient timeline  

\- Role-based dashboards (Reception, Doctor, Lab, Pharmacy)  

\- Secure database with Row Level Security (RLS)  



---



\## System Architecture



The application follows a modular client-server architecture.



\### Frontend Layer

\- React + TypeScript

\- Tailwind CSS

\- Role-based dashboards

\- Modern UI components

\- Real-time UI updates



\### Backend Layer

\- Supabase (PostgreSQL Database + REST API)

\- Real-time subscriptions

\- Secure access policies (RLS)



\### Database Structure



\- `patients`

\- `encounters`

\- `doctors`

\- `tasks`

\- `task\_updates`

\- Department → Doctor relationship mapping



\### Workflow Pipeline



Reception  

→ Department Selection  

→ Doctor Assignment  

→ Consultation  

→ Lab / Pharmacy Tasks  

→ Report Back to Doctor  

→ Timeline Update  

→ Completion  



---



\## Tech Stack



\### Frontend

\- React

\- TypeScript

\- Tailwind CSS

\- Lucide Icons



\### Backend

\- Supabase

\- PostgreSQL

\- Supabase Realtime



\### Development Tools

\- Google AI Studio (AI-assisted development)

\- GitHub (Version control)



---



\## Directory Structure



```

medflow-clinic/

│

├── src/

│   ├── components/        # Reusable UI components

│   ├── pages/             # Reception, Doctor, Lab, Pharmacy views

│   ├── lib/               # Supabase configuration

│   ├── types/             # TypeScript interfaces

│   ├── styles/            # Global styles

│   └── main.tsx

│

├── assets/                # Static assets

├── docs/                  # Documentation \& diagrams

├── public/                # Public files

│

├── package.json

├── tailwind.config.js

└── README.md

```



---



\## Installation \& Setup



\### 1. Clone Repository



```bash

git clone https://github.com/your-username/medflow-clinic.git

cd medflow-clinic

```



\### 2. Install Dependencies



```bash

npm install

```



\### 3. Configure Environment Variables



Create a `.env` file:



```

VITE\_SUPABASE\_URL=your\_supabase\_url

VITE\_SUPABASE\_ANON\_KEY=your\_supabase\_anon\_key

```



You can find these in:

Supabase Dashboard → Project Settings → API



\### 4. Run Development Server



```bash

npm run dev

```



Open:

http://localhost:5173



---



\## Security



\- Row Level Security (RLS) enabled

\- Controlled API access

\- Secure database relations



---



\## Future Improvements



\- AI-assisted triage recommendations

\- Advanced analytics dashboard

\- Multi-clinic scalability

\- Automated patient notifications



---



\## Team



Developed as part of the Vibe Coding Hackathon.



---



\## License



For educational and hackathon purposes.



