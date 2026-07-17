# 💰 MoneyTrack - Personal Finance Tracker

A modern and responsive personal finance management application that helps users track income, expenses, budgets, and savings goals through a clean dashboard interface.

MoneyTrack allows users to manage their daily financial activities, analyze spending patterns, and monitor their financial progress using interactive charts and reports.

---

# 🚀 Features

## 🔐 Authentication

- User registration and login
- Secure password encryption
- Protected dashboard routes
- User profile management


## 📊 Financial Dashboard

- Total balance overview
- Total income tracking
- Total expense tracking
- Savings summary
- Recent transactions


## 💵 Income Management

- Add income records
- Edit income details
- Delete income records
- Categorize income sources


## 💸 Expense Management

- Add daily expenses
- Update expense records
- Delete expenses
- Expense category management


## 📂 Category Management

- Create custom categories
- Edit categories
- Delete categories
- Organize income and expenses


## 🎯 Budget Planning

- Set monthly budgets
- Monitor spending limits
- Track remaining budget


## 🏦 Savings Goals

- Create saving targets
- Track saving progress
- Monitor financial goals


## 📈 Reports & Analytics

- Monthly income reports
- Expense analysis
- Category-based spending charts
- Interactive financial graphs


---

# 🛠️ Tech Stack

## Frontend

- Next.js 16
- TypeScript
- Tailwind CSS
- Shadcn UI
- Recharts


## Backend

- Next.js Server Actions
- REST API


## Database

- PostgreSQL
- Prisma ORM


## Authentication

- NextAuth.js
- JWT


## Deployment

- Vercel
- Supabase PostgreSQL


---

# 📸 Screenshots


## Landing Page

(Add screenshot here)

```
/screenshots/home.png
```


## Dashboard

(Add screenshot here)

```
/screenshots/dashboard.png
```


## Transactions Page

(Add screenshot here)

```
/screenshots/transactions.png
```


## Reports Page

(Add screenshot here)

```
/screenshots/reports.png
```


---

# 📂 Project Structure


```
moneytrack/

├── app/
│   ├── dashboard/
│   ├── transactions/
│   ├── income/
│   ├── expenses/
│   ├── reports/
│
├── components/
│   ├── Navbar.tsx
│   ├── Sidebar.tsx
│   ├── Charts.tsx
│
├── prisma/
│   └── schema.prisma
│
├── lib/
│   ├── prisma.ts
│   └── auth.ts
│
├── public/
│
├── .env
├── package.json
└── README.md
```


---

# ⚙️ Installation Guide


## 1. Clone Repository


```bash
git clone https://github.com/YOUR_USERNAME/moneytrack.git
```


## 2. Navigate to Project


```bash
cd moneytrack
```


## 3. Install Dependencies


```bash
npm install
```


---

# 🔑 Environment Setup


Create a `.env` file in the root directory:


```env
DATABASE_URL="postgresql://username:password@localhost:5432/moneytrack"

NEXTAUTH_SECRET="your-secret-key"

NEXTAUTH_URL="http://localhost:3000"
```


---

# 🗄️ Database Setup


## Create PostgreSQL Database


Example:

```sql
CREATE DATABASE moneytrack;
```


## Generate Prisma Client


```bash
npx prisma generate
```


## Run Database Migration


```bash
npx prisma migrate dev --name init
```


## Open Prisma Studio


```bash
npx prisma studio
```


---

# ▶️ Run Development Server


```bash
npm run dev
```


Application will run on:


```
http://localhost:3000
```


---

# 🌍 Deployment


## Frontend

Deploy using:

```
Vercel
```


## Database

Recommended:

```
Supabase PostgreSQL
```


Steps:

1. Connect GitHub repository with Vercel
2. Add environment variables
3. Deploy project


---

# 🔮 Future Improvements


## AI Features

- AI spending analysis
- Smart saving suggestions
- Expense prediction


## Mobile Application

- React Native mobile app
- Push notifications


## Advanced Finance

- Bank account integration
- Currency conversion
- Investment tracking


## Additional Features

- Export reports as PDF
- Email notifications
- Dark/light theme
- Multi-language support


---

# 👨‍💻 Author


**Althaf Mohammed**

Software Engineering Graduate

---

# ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub.
