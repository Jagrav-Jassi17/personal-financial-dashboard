import React, { useEffect, useState } from 'react';
import Filters from './Filters';
import Charts from './Charts';
import MonthlySummary from './MonthlySummary';
import './Dashboard.css';
import { useAuth } from '../context/AuthContext';

const Dashboard = ({ reload }) => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const [total, setTotal] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ amount: '', category: '', note: '' });
  const [filters, setFilters] = useState({ startDate: null, endDate: null });

  const { token } = useAuth();

  useEffect(() => {
    fetchData();
  }, [reload]);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const fetchData = () => {
    fetch('http://localhost:5000/api/transactions', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setTransactions(data);
      })
      .catch(err => console.error('Error fetching transactions:', err));
  };

  const applyFilters = () => {
    const { startDate, endDate } = filters;

    const filtered = transactions.filter(txn => {
      const txnDate = new Date(txn.date);
      const start = startDate ? new Date(startDate.setHours(0, 0, 0, 0)) : null;
      const end = endDate ? new Date(endDate.setHours(23, 59, 59, 999)) : null;

      return (
        (!start || txnDate >= start) &&
        (!end || txnDate <= end)
      );
    });

    setFilteredTransactions(filtered);
    calculateTotals(filtered);
    setShowAll(false); // reset on filter change
  };

  const calculateTotals = (data) => {
    let incomeTotal = 0, expenseTotal = 0;
    data.forEach(txn => {
      const amt = parseFloat(txn.amount);
      if (txn.type === 'income') incomeTotal += amt;
      else if (txn.type === 'expense') expenseTotal += amt;
    });
    setIncome(incomeTotal);
    setExpense(expenseTotal);
    setTotal(incomeTotal - expenseTotal);
  };

  const deleteTransaction = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/transactions/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const updated = transactions.filter(txn => txn._id !== id);
      setTransactions(updated);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const startEditing = (txn) => {
    setEditingId(txn._id);
    setEditData({ amount: txn.amount, category: txn.category, note: txn.note });
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const saveEdit = async (txn) => {
    try {
      const updatedTxn = {
        ...txn,
        amount: parseFloat(editData.amount),
        category: editData.category,
        note: editData.note,
      };
      const res = await fetch(`http://localhost:5000/api/transactions/${txn._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updatedTxn)
      });
      const updated = await res.json();
      const newList = transactions.map(t => t._id === updated._id ? updated : t);
      setTransactions(newList);
      setEditingId(null);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const displayedTransactions = showAll
    ? filteredTransactions
    : filteredTransactions.slice(0, 5);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>

      <div className="summary">
        <div className="summary-box income">Income: ₹{income.toFixed(2)}</div>
        <div className="summary-box expense">Expenses: ₹{expense.toFixed(2)}</div>
        <div className="summary-box balance">Balance: ₹{total.toFixed(2)}</div>
      </div>

      <Filters onFilterChange={handleFilterChange} />

      <div className="transaction-list">
  <div className="transaction-header">
    <h3>{showAll ? 'All Filtered Transactions' : 'Latest Transactions'}</h3>
    {filteredTransactions.length > 5 && (
      <button className="show-all-btn" onClick={() => setShowAll(prev => !prev)}>
        {showAll ? 'Show Less' : 'Show All'}
      </button>
    )}
  </div>

  <ul>
    {displayedTransactions.map(txn => (
      <li key={txn._id} className={`txn-item ${txn.type}`}>
        {editingId === txn._id ? (
          <div className="edit-fields">
            <input
              type="number"
              name="amount"
              value={editData.amount}
              onChange={handleEditChange}
            />
            <input
              type="text"
              name="category"
              value={editData.category}
              onChange={handleEditChange}
            />
            <input
              type="text"
              name="note"
              value={editData.note}
              onChange={handleEditChange}
            />
            <button onClick={() => saveEdit(txn)}>💾</button>
            <button onClick={cancelEdit}>❌</button>
          </div>
        ) : (
          <>
            <span className="txn-main">
              ₹{txn.amount} - {txn.category}
              {txn.note ? ` (${txn.note})` : ''}
            </span>
            <small className="txn-date">
              {new Date(txn.date).toLocaleString()}
            </small>
            <div className="actions">
              <button onClick={() => startEditing(txn)}>✏️</button>
              <button onClick={() => deleteTransaction(txn._id)}>🗑️</button>
            </div>
          </>
        )}
      </li>
    ))}
  </ul>
</div>


      <Charts data={filteredTransactions} />
      <MonthlySummary transactions={transactions} />
    </div>
  );
};

export default Dashboard;
