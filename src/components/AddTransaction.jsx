import React, { useState } from 'react';
import './AddTransaction.css';
import { useAuth } from '../context/AuthContext';

const AddTransaction = ({ onTransactionAdded }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [note, setNote] = useState('');
  const { token } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newTransaction = {
      type,
      amount: parseFloat(amount),
      category,
      note,
      date: new Date().toISOString()
    };

    try {
      const res = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newTransaction),
      });

      const data = await res.json();

      if (res.ok) {
        setAmount('');
        setCategory('');
        setNote('');
        if (onTransactionAdded) onTransactionAdded(data);
      } else {
        alert(data.error || 'Add failed');
      }
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h2>Add Transaction</h2>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="expense">Expense</option>
        <option value="income">Income</option>
      </select>

      <input
        type="number"
        placeholder="Amount"
        required
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />

      <input
        type="text"
        placeholder="Category (e.g. Food, Rent)"
        required
        value={category}
        onChange={(e) => setCategory(e.target.value)}
      />

      <input
        type="text"
        placeholder="Note (optional)"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />

      <button type="submit">Add</button>
    </form>
  );
};

export default AddTransaction;
