# 0Budget
### The Zero-Budget Filmmaking Network

**0Budget** is a platform designed to connect aspiring filmmakers, independent creators, film students, and production companies.

The idea is simple: creative filmmaking shouldn't be limited by someone's financial resources or access to industry connections.

0Budget aims to give creators a place to showcase their skills, share filmmaking ideas, discover projects, find collaborators, and connect with opportunities in the film industry.

---

## 🎬 Vision

To build a collaborative filmmaking network where creative people can turn ideas into reality, regardless of their budget, experience, or industry connections.

## 🎯 Core Objectives

- Connect filmmakers, cinematographers, editors, writers, actors, and other creative professionals.
- Help independent creators discover collaborators.
- Allow users to create profiles and showcase their portfolios.
- Provide a platform to publish filmmaking projects and find team members.
- Connect aspiring creators with production companies and industry opportunities.
- Make filmmaking collaboration more accessible.

## 🛠️ Technology Stack

The project uses modern web technologies:

- **Frontend:** React.js
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Programming Language:** JavaScript
- **Backend Services:** Supabase
- **Authentication:** Supabase Auth
- **Database:** PostgreSQL (Supabase)
- **Version Control:** Git and GitHub

## 📁 Repository Structure

This repository contains the development phases of 0Budget.

```text
0BudgetAllphases/
│
├── 0budget-phase1/
│   └── 0budget/
│       ├── src/
│       ├── public/
│       └── package.json
│
├── 0budget-phase2/
│   └── 0budget/
│       ├── src/
│       ├── public/
│       ├── supabase/
│       ├── package.json
│       └── .env.example
│
└── README.md
```

## 🚀 Development Roadmap

| Phase | Development | Status |
|---|---|---|
| Phase 1 | Landing Page and Website Foundation | Completed |
| Phase 2 | User Authentication and Onboarding | Completed |
| Phase 3 | Creator Profiles and Portfolios | Planned / In Development |
| Phase 4 | Project Creation and Discovery | Planned |
| Phase 5 | Creator Directory and Applications | Planned |
| Phase 6 | Production Company Profiles | Planned |
| Phase 7 | Filmmaking Opportunities | Planned |
| Phase 8 | Messaging and Notifications | Planned |
| Phase 9 | Testing and Deployment | Planned |

## 💻 Running the Project Locally

Each development phase is maintained as a separate application.

### Phase 1

```bash
cd 0budget-phase1/0budget
npm install
npm run dev
```

### Phase 2

```bash
cd 0budget-phase2/0budget
npm ci
```

Create a `.env` file in the Phase 2 project directory using `.env.example` as a reference.

Add your own Supabase project credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

Then run:

```bash
npm run dev
```

**Note:** Never upload your `.env` file, passwords, private API keys, or Supabase service-role keys to GitHub.

## 🌱 Project Philosophy

0Budget is built around the belief that:

- Talent should have opportunities to grow.
- Creative ideas deserve a chance to be developed.
- Collaboration can help independent creators achieve more.
- Filmmaking opportunities should be transparent about compensation and expectations.
- A limited budget shouldn't automatically mean a limited creative future.

## 👨‍💻 Project Development

0Budget is an independently developed project, built through