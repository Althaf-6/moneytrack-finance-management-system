// One-off demo seed: creates a demo account with realistic finance data.
// Usage: node --env-file=.env scripts/seed.mjs
import pg from "pg";
import { randomBytes, scryptSync } from "crypto";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

const CATS = [
  ["Salary", "INCOME"],
  ["Business", "INCOME"],
  ["Freelance", "INCOME"],
  ["Investment", "INCOME"],
  ["Food", "EXPENSE"],
  ["Transport", "EXPENSE"],
  ["Shopping", "EXPENSE"],
  ["Bills", "EXPENSE"],
  ["Health", "EXPENSE"],
  ["Education", "EXPENSE"],
  ["Entertainment", "EXPENSE"],
];

// [title, amount, type, category, date, description]
const TX = [
  // ---- income ----
  ["Monthly Salary", 150000, "INCOME", "Salary", "2026-02-01", "Software engineer payroll"],
  ["Monthly Salary", 150000, "INCOME", "Salary", "2026-03-01", "Software engineer payroll"],
  ["Monthly Salary", 150000, "INCOME", "Salary", "2026-04-01", "Software engineer payroll"],
  ["Monthly Salary", 150000, "INCOME", "Salary", "2026-05-01", "Software engineer payroll"],
  ["Monthly Salary", 150000, "INCOME", "Salary", "2026-06-01", "Software engineer payroll"],
  ["Monthly Salary", 150000, "INCOME", "Salary", "2026-07-01", "Software engineer payroll"],
  ["Website project", 35000, "INCOME", "Freelance", "2026-03-15", "Landing page for a local cafe"],
  ["Mobile app UI design", 42500, "INCOME", "Freelance", "2026-05-20", "FinTech onboarding screens"],
  ["Logo design gig", 28000, "INCOME", "Freelance", "2026-07-10", "Brand refresh for a startup"],
  ["Dividend payout", 12000, "INCOME", "Investment", "2026-06-05", "Quarterly dividends"],

  // ---- expenses Feb ----
  ["Groceries", 8200, "EXPENSE", "Food", "2026-02-04", "Weekly supermarket run"],
  ["Fuel refill", 5500, "EXPENSE", "Transport", "2026-02-07", null],
  ["Internet Bill", 5000, "EXPENSE", "Bills", "2026-02-02", "Fiber broadband"],
  ["Online course", 10000, "EXPENSE", "Education", "2026-02-18", "TypeScript masterclass"],
  ["Movie night", 3500, "EXPENSE", "Entertainment", "2026-02-21", null],

  // ---- expenses Mar ----
  ["Groceries", 9150, "EXPENSE", "Food", "2026-03-05", null],
  ["Dinner out", 4600, "EXPENSE", "Food", "2026-03-14", "Family dinner"],
  ["Train passes", 6200, "EXPENSE", "Transport", "2026-03-06", null],
  ["Electricity bill", 4300, "EXPENSE", "Bills", "2026-03-09", null],
  ["New sneakers", 16500, "EXPENSE", "Shopping", "2026-03-22", null],
  ["Pharmacy", 2100, "EXPENSE", "Health", "2026-03-17", null],

  // ---- expenses Apr ----
  ["Groceries", 7800, "EXPENSE", "Food", "2026-04-03", null],
  ["Fuel refill", 5800, "EXPENSE", "Transport", "2026-04-08", null],
  ["Internet Bill", 5000, "EXPENSE", "Bills", "2026-04-02", "Fiber broadband"],
  ["Design workshop", 10000, "EXPENSE", "Education", "2026-04-19", "Weekend UI workshop"],
  ["Birthday gift", 7500, "EXPENSE", "Shopping", "2026-04-12", null],

  // ---- expenses May ----
  ["Groceries", 8600, "EXPENSE", "Food", "2026-05-05", null],
  ["Coffee & snacks", 3200, "EXPENSE", "Food", "2026-05-11", null],
  ["Fuel refill", 6000, "EXPENSE", "Transport", "2026-05-07", null],
  ["Electricity bill", 4500, "EXPENSE", "Bills", "2026-05-10", null],
  ["Water bill", 1800, "EXPENSE", "Bills", "2026-05-10", null],
  ["Concert tickets", 12000, "EXPENSE", "Entertainment", "2026-05-24", null],

  // ---- expenses Jun ----
  ["Groceries", 8900, "EXPENSE", "Food", "2026-06-04", null],
  ["Fuel refill", 5700, "EXPENSE", "Transport", "2026-06-06", null],
  ["Internet Bill", 5000, "EXPENSE", "Bills", "2026-06-02", "Fiber broadband"],
  ["Clothing", 13000, "EXPENSE", "Shopping", "2026-06-15", "Work wardrobe update"],
  ["Dental checkup", 6500, "EXPENSE", "Health", "2026-06-20", null],

  // ---- expenses Jul (current) ----
  ["Groceries run", 8500, "EXPENSE", "Food", "2026-07-03", "Weekly supermarket run"],
  ["Internet Bill", 5000, "EXPENSE", "Bills", "2026-07-02", "Fiber broadband"],
  ["Fuel refill", 6000, "EXPENSE", "Transport", "2026-07-05", null],
  ["Dinner with friends", 5200, "EXPENSE", "Food", "2026-07-08", "Weekend catch-up"],
  ["New headphones", 14500, "EXPENSE", "Shopping", "2026-07-09", "Noise cancelling"],
  ["Electricity bill", 4300, "EXPENSE", "Bills", "2026-07-12", null],
  ["Pharmacy", 1850, "EXPENSE", "Health", "2026-07-14", null],
];

const GOALS = [
  ["Buy Laptop", 200000, 80000, "2026-10-01"],
  ["Emergency Fund", 500000, 125000, "2027-06-30"],
];

const BUDGETS = [["2026-06", 55000], ["2026-07", 60000]];

const client = await pool.connect();
try {
  await client.query("BEGIN");

  const existing = await client.query(
    "SELECT id FROM users WHERE email = $1",
    ["althaf@gmail.com"],
  );
  if (existing.rows.length) {
    console.log("Demo user already exists — skipping seed.");
    await client.query("ROLLBACK");
    process.exit(0);
  }

  const { rows: [user] } = await client.query(
    "INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id",
    ["Althaf", "althaf@gmail.com", hashPassword("password123")],
  );
  const uid = user.id;

  const catIds = {};
  for (const [name, type] of CATS) {
    const { rows: [c] } = await client.query(
      "INSERT INTO categories (user_id, name, type) VALUES ($1, $2, $3) RETURNING id",
      [uid, name, type],
    );
    catIds[name] = c.id;
  }

  for (const [title, amount, type, cat, date, desc] of TX) {
    await client.query(
      `INSERT INTO transactions (user_id, category_id, title, amount, type, date, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [uid, catIds[cat] ?? null, title, amount, type, date, desc ?? null],
    );
  }

  for (const [month, limit] of BUDGETS) {
    await client.query(
      "INSERT INTO budgets (user_id, month, monthly_limit) VALUES ($1, $2, $3)",
      [uid, month, limit],
    );
  }

  for (const [title, target, current, deadline] of GOALS) {
    await client.query(
      `INSERT INTO saving_goals (user_id, title, target_amount, current_amount, deadline)
       VALUES ($1, $2, $3, $4, $5)`,
      [uid, title, target, current, deadline],
    );
  }

  await client.query("COMMIT");
  console.log("Seeded demo account: althaf@gmail.com / password123");
  console.log(
    `Inserted ${TX.length} transactions, ${CATS.length} categories, ${BUDGETS.length} budgets, ${GOALS.length} goals.`,
  );
} catch (err) {
  await client.query("ROLLBACK");
  console.error("Seed failed:", err);
  process.exit(1);
} finally {
  client.release();
  await pool.end();
}
