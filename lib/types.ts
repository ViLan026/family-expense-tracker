export type Member = { id: string; username: string };

export type Transaction = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  amount: number;
  transaction_date: string; // YYYY-MM-DD
  created_at: string;
  users: { username: string } | null;
};

export type MonthlyBudget = {
  id: string;
  user_id: string;
  year: number;
  month: number;
  amount: number;
  created_at: string;
  updated_at: string;
};

export type ActionState = { error?: string; ok?: boolean };


