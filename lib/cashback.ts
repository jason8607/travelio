import type { CreditCard, Expense } from "@/types";

export function calculateTotalCashback(
  expenses: Expense[],
  cards: CreditCard[]
): number {
  if (cards.length === 0) return 0;
  const creditExpenses = expenses.filter((e) => e.payment_method === "信用卡");
  if (creditExpenses.length === 0) return 0;

  return cards.reduce((total, card) => {
    const cardExpenses = creditExpenses.filter(
      (e) => e.credit_card_id === card.id
    );
    if (cardExpenses.length === 0) return total;

    const hasPlans = card.plans && card.plans.length > 0;
    let cardCashback = 0;

    if (hasPlans) {
      cardCashback = card.plans!.reduce((s, plan) => {
        const planTwd = cardExpenses
          .filter((e) => e.credit_card_plan_id === plan.id)
          .reduce((sum, e) => sum + e.amount_twd, 0);
        return s + Math.round((planTwd * plan.cashback_rate) / 100);
      }, 0);
    } else {
      const cardTwd = cardExpenses.reduce((s, e) => s + e.amount_twd, 0);
      cardCashback = Math.round((cardTwd * card.cashback_rate) / 100);
    }

    return total + Math.min(cardCashback, card.cashback_limit);
  }, 0);
}
