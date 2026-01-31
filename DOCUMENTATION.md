# Invofy - Documentation

Welcome to **Invofy**! This is a production-ready SaaS starter kit built with the modern web stack: Next.js 14+ (App Router), Tailwind CSS, Prisma, Stripe, and NextAuth.js.

This documentation will guide you through setting up, configuring, and deploying your application.

---

## 📚 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Variables](#environment-variables)
4. [Database Setup](#database-setup)
5. [Project Structure](#project-structure)
6. [Stripe Integration](#stripe-integration)
7. [Authentication](#authentication)
8. [Deployment](#deployment)

---

## <a name="prerequisites"></a>1. Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher.
- **npm** (Node Package Manager) or **yarn** / **pnpm**.
- **PostgreSQL**: A running PostgreSQL instance (local or hosted like Supabase/Neon/Railway).
- **Stripe Account**: For handling payments.

---

## <a name="installation"></a>2. Installation

1.  **Clone the Repository**
    Extract the downloaded zip file or clone the repo:

    ```bash
    git clone https://github.com/yourusername/next-saas-pro.git
    cd next-saas-pro
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

---

## <a name="environment-variables"></a>3. Environment Variables

Create a `.env` file in the root directory. You can copy the example file:

```bash
cp .env.example .env
```

Open `.env` and configure the following variables:

### Database

```env
# Connection string to your PostgreSQL database
DATABASE_URL="postgresql://johndoe:randompassword@localhost:5432/mydb?schema=public"
```

### Authentication (NextAuth.js)

```env
# A random string used to hash tokens. You can generate one via `openssl rand -base64 32`
AUTH_SECRET="your-super-secret-key"

# The base URL of your application (e.g., http://localhost:3000 for local dev)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Stripe (Payments)

```env
# Found in Stripe Dashboard -> Developers -> API Keys
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."

# Found in Stripe Dashboard -> Developers -> Webhooks
# You need to create a webhook endpoint pointing to yourdomain.com/api/webhooks/stripe
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## <a name="database-setup"></a>4. Database Setup

We use **Prisma ORM** to manage the database.

1.  **Push the Schema**
    This command syncs your Prisma schema with your database.

    ```bash
    npx prisma db push
    ```

2.  **Seed the Database (Optional but Recommended)**
    We have a seed script to create initial data (like roles/permissions).
    ```bash
    npx prisma db seed
    ```

---

## <a name="project-structure"></a>5. Project Structure

Here is a quick overview of the main folders:

- **`app/`**: Contains the application source code (Next.js App Router).
  - **`(auth)/`**: Route groups for login, register, etc.
  - **`(dashboard)/`**: Route groups for the protected dashboard area.
  - **`api/`**: Backend API routes (Auth, Stripe webhooks, etc.).
- **`components/`**: Reusable React components (Buttons, Modals, etc.).
- **`lib/`**: Utility functions, Prisma client instance, Stripe configuration.
- **`prisma/`**: Database schema (`schema.prisma`) and seed scripts.
- **`public/`**: Static assets like images and fonts.

---

## <a name="stripe-integration"></a>6. Stripe Integration

This starter kit comes pre-configured with Stripe for subscriptions.

1.  **Create Products**: Go to your Stripe Dashboard and create your subscription products (e.g., "Pro Plan").
2.  **Update Config**: You may need to map your Price IDs in the code or database depending on your implementation preference (check `lib/stripe.ts` or related services).
3.  **Webhooks**: efficient billing relies on webhooks. Ensure your `STRIPE_WEBHOOK_SECRET` is correct.
    - For local development, use the Stripe CLI to forward webhooks:
      ```bash
      stripe listen --forward-to localhost:3000/api/webhooks/stripe
      ```

---

## <a name="authentication"></a>7. Authentication

We use **NextAuth.js (v5)**.

- **Credentials Provider**: Supports email/password login.
- **Role Based Access**: The `User` model includes a `roleId` to support permissions (e.g., Admin vs User).

To customize auth settings, check `lib/auth.ts` (or `auth.ts` in the root depending on config).

---

## <a name="deployment"></a>8. Deployment

The easiest way to deploy is **Vercel**.

1.  Push your code to a GitHub repository.
2.  Import the project into Vercel.
3.  Add your **Environment Variables** in the Vercel Project Settings.
4.  Deploy!

For database hosting, you can use **Supabase**, **Neon**, **Railway**, or any PostgreSQL provider.

---

**Thank you for choosing Invofy!**
If you have any questions, please reach out to support.
