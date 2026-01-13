# NextSaaS Pro

NextSaaS Pro is a production-ready SaaS starter kit built with Next.js 14+, Tailwind CSS, Prisma, and Stripe.

## Features

- **Authentication**: Secure login/register with NextAuth.js (Credentials).
- **RBAC**: Role-Based Access Control (Super Admin, Admin, User).
- **Billing**: Stripe subscription integration (Checkout & Customer Portal).
- **Dashboard**: Responsive dashboard with charts and data tables.
- **Settings**: Profile management and account deletion.
- **UI/UX**: Dark/Light mode, Tailwind CSS, and Shadcn UI components.
- **Database**: PostgreSQL with Prisma ORM.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **ORM**: Prisma
- **Auth**: NextAuth.js (Auth.js)
- **Payments**: Stripe
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## Getting Started

### Prerequisites

- Node.js 18+
- MySQL (or use a local instance)
- Stripe Account

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/next-saas-starter.git
   cd next-saas-starter
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the values.

   ```bash
   cp env.example .env
   ```

4. Set up the database:

   ```bash
   npx prisma migrate dev
   npx prisma db seed
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

## Environment Variables

```env
DATABASE_URL="mysql://root:root@localhost:3306/next_saas_pro"
AUTH_SECRET="secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Folder Structure

```
app/
├── (auth)/         # Authentication pages
├── (dashboard)/    # Dashboard pages
├── api/            # API routes
components/         # Reusable components
lib/                # Utilities and configurations
prisma/             # Database schema and seed script
```

## License

MIT
