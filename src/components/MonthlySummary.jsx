import React from 'react';
import './MonthlySummary.css';

const MonthlySummary = ({ transactions }) => {
  const monthlyMap = {};

  transactions.forEach(txn => {
    const date = new Date(txn.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { income: 0, expense: 0 };
    }

    const amount = parseFloat(txn.amount);
    if (txn.type === 'income') {
      monthlyMap[monthKey].income += amount;
    } else {
      monthlyMap[monthKey].expense += amount;
    }
  });

  const summaryList = Object.entries(monthlyMap)
    .map(([month, values]) => ({
      month,
      ...values,
      balance: values.income - values.expense
    }))
    .sort((a, b) => new Date(b.month) - new Date(a.month));

  return (
    <div className="monthly-summary">
      <h3>Monthly Summary</h3>
      <ul>
        {summaryList.map((item, idx) => (
          <li key={idx}>
            <strong>{item.month}</strong> — 
            Income: ₹{item.income.toFixed(2)}, 
            Expense: ₹{item.expense.toFixed(2)}, 
            Balance: ₹{item.balance.toFixed(2)}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MonthlySummary;
