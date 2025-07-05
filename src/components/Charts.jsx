import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];

const Charts = ({ data = [] }) => {
  const incomeData = data.filter(t => t.type === 'income');
  const expenseData = data.filter(t => t.type === 'expense');

  // Pie Chart for Expense by Category
  const categoryTotals = expenseData.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + parseFloat(curr.amount);
    return acc;
  }, {});

  const pieData = Object.entries(categoryTotals).map(([category, amount]) => ({
    name: category,
    value: amount
  }));

  // Bar Chart: group by date
  const groupedByDate = {};

  data.forEach((txn) => {
    const date = new Date(txn.date).toLocaleDateString();
    if (!groupedByDate[date]) {
      groupedByDate[date] = { date, income: 0, expense: 0 };
    }
    if (txn.type === 'income') {
      groupedByDate[date].income += parseFloat(txn.amount);
    } else if (txn.type === 'expense') {
      groupedByDate[date].expense += parseFloat(txn.amount);
    }
  });

  const barData = Object.values(groupedByDate).sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="charts">
      <h3>Expense by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={100} label>
            {pieData.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>

      <h3>Income & Expenses Over Time</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={barData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="income" fill="#00C49F" name="Income" />
          <Bar dataKey="expense" fill="#FF8042" name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Charts;
