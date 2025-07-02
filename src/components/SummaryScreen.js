// File: src/components/SummaryScreen.js
import React from 'react';

const SummaryScreen = ({ users, expenses }) => {
  const balances = {};
  const contributions = {};
  const expensesOwed = {};

  users.forEach(user => {
    balances[user.email] = 0;
    contributions[user.email] = 0;
    expensesOwed[user.email] = 0;
  });

  let totalExpense = 0;

  expenses.forEach(({ amount, paidBy, sharedWith, splitType, shares }) => {
    totalExpense += amount;
    contributions[paidBy] += amount;

    let splits = [];

    if (splitType === 'equal') {
      const share = amount / sharedWith.length;
      splits = sharedWith.map(() => share);
    } else if (splitType === 'percent') {
      splits = shares.map(s => (amount * parseFloat(s)) / 100);
    } else if (splitType === 'shares') {
      const totalShares = shares.reduce((sum, s) => sum + parseFloat(s), 0);
      splits = shares.map(s => (amount * parseFloat(s)) / totalShares);
    } else if (splitType === 'amount') {
      splits = shares.map(s => parseFloat(s));
    }

    sharedWith.forEach((userEmail, i) => {
      expensesOwed[userEmail] += splits[i];
      if (userEmail !== paidBy) {
        balances[userEmail] -= splits[i];
        balances[paidBy] += splits[i];
      }
    });
  });

  const getUserName = (email) => {
    return users.find(u => u.email === email)?.name || email;
  };

  const getSettlements = (balances) => {
    const pos = [];
    const neg = [];

    Object.entries(balances).forEach(([email, balance]) => {
      if (balance > 0.01) pos.push({ email, balance });
      else if (balance < -0.01) neg.push({ email, balance });
    });

    const settlements = [];
    pos.sort((a, b) => b.balance - a.balance);
    neg.sort((a, b) => a.balance - b.balance);

    while (pos.length && neg.length) {
      const creditor = pos[0];
      const debtor = neg[0];
      const settledAmount = Math.min(creditor.balance, -debtor.balance);

      settlements.push({
        from: debtor.email,
        to: creditor.email,
        amount: settledAmount.toFixed(2),
      });

      creditor.balance -= settledAmount;
      debtor.balance += settledAmount;

      if (creditor.balance < 0.01) pos.shift();
      if (debtor.balance > -0.01) neg.shift();
    }

    return settlements;
  };

  const settlements = getSettlements(balances);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Summary</h2>

      {/* Total Expense */}
      <div className="mb-4">
        <strong>Total Expense:</strong> ${totalExpense.toFixed(2)}
      </div>

      {/* Contributions */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Individual Contributions</h3>
        <ul className="space-y-1">
          {Object.entries(contributions).map(([email, amt]) => (
            <li key={email}>
              {getUserName(email)} paid: ${amt.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {/* Individual Expenses */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Individual Expense Share</h3>
        <ul className="space-y-1">
          {Object.entries(expensesOwed).map(([email, amt]) => (
            <li key={email}>
              {getUserName(email)} owes (share): ${amt.toFixed(2)}
            </li>
          ))}
        </ul>
      </div>

      {/* Net Settlements */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Settlements</h3>
        {settlements.length === 0 ? (
          <p className="text-green-600">All expenses are settled!</p>
        ) : (
          <ul className="space-y-2">
            {settlements.map((s, i) => (
              <li key={i} className="border p-3 rounded">
                <strong>{getUserName(s.from)}</strong> owes <strong>{getUserName(s.to)}</strong> ${s.amount}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SummaryScreen;
