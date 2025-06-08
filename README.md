# SOS Beauty Registration System

A modern web application for managing beauty service registrations, built with Next.js, TypeScript, and Tailwind CSS.

## Features

- User registration and authentication
- Service booking system
- Admin dashboard
- Multi-language support (Hungarian/English)
- Cookie consent management
- PDF policy document generation
- Responsive design

## Tech Stack

- Next.js
- TypeScript
- Tailwind CSS
- Prisma (Database ORM)
- PostgreSQL
- Puppeteer (for PDF generation)
- Usercentrics (Cookie Consent Management)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sosbeautyreg.git
cd sosbeautyreg
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
DATABASE_URL="your_database_url"
NEXTAUTH_SECRET="your_nextauth_secret"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Environment Variables

- `DATABASE_URL`: PostgreSQL database connection string
- `NEXTAUTH_SECRET`: Secret key for NextAuth.js
- `NEXTAUTH_URL`: Base URL for NextAuth.js
- `NEXT_PUBLIC_BASE_URL`: Base URL for the application

## License

This project is proprietary and confidential. All rights reserved. 