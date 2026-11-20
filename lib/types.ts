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

export type ActionState = { error?: string; ok?: boolean };
