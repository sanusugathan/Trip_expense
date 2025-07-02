// File: src/components/ExpenseScreen.js
import React, { useState } from 'react';

const ExpenseScreen = ({ users, expenses, addExpense, updateExpense, removeExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [shares, setShares] = useState([]);

  // Toggle selection of users to split the expense
  const toggleUser = (email) => {
    const exists = selectedUsers.includes(email);
    const updated = exists ? selectedUsers.filter(e => e !== email) : [...selectedUsers, email];
    setSelectedUsers(updated);
    setShares(updated.map(() => ''));
  };

  // Handle change in share amounts when splitting by share/percent
  const handleShareChange = (index, value) => {
    const updated = [...shares];
    updated[index] = value;
    setShares(updated);
  };

  // Handle the form submission to add a new expense
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!description || !amount || !paidBy || selectedUsers.length === 0) return;
    addExpense({
      description,
      amount: parseFloat(amount),
      paidBy,
      date,
      splitType,
      sharedWith: selectedUsers,
      shares
    });
    // Reset form fields
    setDescription('');
    setAmount('');
    setPaidBy('');
    setDate('');
    setSplitType('equal');
    setSelectedUsers([]);
    setShares([]);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Add Expense</h2>
      <form onSubmit={handleSubmit} className="space-y-3 mb-6">
        <input
          className="border p-2 w-full"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <input
          className="border p-2 w-full"
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <select
          className="border p-2 w-full"
          value={paidBy}
          onChange={(e) => setPaidBy(e.target.value)}
        >
          <option value="">Paid By</option>
          {users.map((u) => (
            <option key={u.email} value={u.email}>
              {u.name}
            </option>
          ))}
        </select>
        <input
          className="border p-2 w-full"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <div>
          <label className="font-medium">Split Type:</label>
          <select
            className="border p-2 w-full"
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
          >
            <option value="equal">Equally</option>
            <option value="percent">Percentage</option>
            <option value="shares">Shares</option>
            <option value="amount">Exact Amount</option>
          </select>
        </div>

        <div className="mt-2 space-y-2">
          {users.map((u) => (
            <div key={u.email} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={selectedUsers.includes(u.email)}
                onChange={() => toggleUser(u.email)}
              />
              <span>{u.name}</span>
              {selectedUsers.includes(u.email) && splitType !== 'equal' && (
                <input
                  className="border p-1 w-32"
                  placeholder={splitType}
                  type="number"
                  value={shares[selectedUsers.indexOf(u.email)] || ''}
                  onChange={(e) => handleShareChange(selectedUsers.indexOf(u.email), e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Add Expense
        </button>
      </form>

      <h3 className="text-lg font-semibold mb-2">Existing Expenses</h3>
      <ul>
        {expenses.map((exp, idx) => (
          <li key={idx} className="border-b py-2">
            <div className="flex justify-between items-center">
              <div>
                <strong>{exp.description}</strong> - ${exp.amount} paid by{' '}
                {users.find((u) => u.email === exp.paidBy)?.name || exp.paidBy}
              </div>
              <button onClick={() => removeExpense(idx)} className="text-red-600">
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseScreen;
