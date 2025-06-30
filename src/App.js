import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

export default function TripExpenseSplitter() {
  const [expenses, setExpenses] = useState([]);
  const [members, setMembers] = useState(["Alice", "Bob", "Charlie"]);
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    date: "",
    splitMethod: "equal",
    splits: {},
  });

  const handleAddExpense = () => {
    if (!newExpense.name || !newExpense.amount || !newExpense.date) return;
    setExpenses([...expenses, newExpense]);
    setNewExpense({ name: "", amount: "", date: "", splitMethod: "equal", splits: {} });
  };

  const calculateBalances = () => {
    const balance = {};
    members.forEach(member => (balance[member] = 0));

    expenses.forEach(exp => {
      const total = parseFloat(exp.amount);
      if (exp.splitMethod === "equal") {
        const share = total / members.length;
        members.forEach(member => {
          balance[member] -= share;
        });
      } else if (exp.splitMethod === "percentage") {
        members.forEach(member => {
          balance[member] -= (total * (exp.splits[member] || 0)) / 100;
        });
      } else if (exp.splitMethod === "shares") {
        const totalShares = Object.values(exp.splits).reduce((a, b) => a + Number(b), 0);
        members.forEach(member => {
          const share = ((exp.splits[member] || 0) / totalShares) * total;
          balance[member] -= share;
        });
      } else if (exp.splitMethod === "unequal") {
        members.forEach(member => {
          balance[member] -= exp.splits[member] || 0;
        });
      }
    });

    return balance;
  };

  const balances = calculateBalances();

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Trip Expense Splitter</h1>

      <Card className="mb-4">
        <CardContent className="p-4 grid gap-4">
          <Label>Expense Name</Label>
          <Input
            value={newExpense.name}
            onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })}
          />

          <Label>Amount (INR)</Label>
          <Input
            type="number"
            value={newExpense.amount}
            onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
          />

          <Label>Date</Label>
          <Input
            type="date"
            value={newExpense.date}
            onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
          />

          <Label>Split Method</Label>
          <select
            className="border p-2 rounded"
            value={newExpense.splitMethod}
            onChange={(e) => setNewExpense({ ...newExpense, splitMethod: e.target.value })}
          >
            <option value="equal">Equal</option>
            <option value="percentage">Percentage</option>
            <option value="shares">Shares</option>
            <option value="unequal">Unequal</option>
          </select>

          {newExpense.splitMethod !== "equal" && (
            <div className="grid gap-2">
              {members.map((member) => (
                <div key={member} className="flex items-center gap-2">
                  <Label className="w-24">{member}</Label>
                  <Input
                    type="number"
                    value={newExpense.splits[member] || ""}
                    onChange={(e) =>
                      setNewExpense({
                        ...newExpense,
                        splits: {
                          ...newExpense.splits,
                          [member]: parseFloat(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              ))}
            </div>
          )}

          <Button onClick={handleAddExpense}>Add Expense</Button>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Expenses</h2>
          {expenses.map((exp, idx) => (
            <div key={idx} className="border-b py-2">
              <p className="font-medium">{exp.name} - ₹{exp.amount}</p>
              <p className="text-sm">Date: {format(new Date(exp.date), "dd MMM yyyy")}</p>
              <p className="text-sm capitalize">Split: {exp.splitMethod}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold mb-2">Summary</h2>
          {members.map((member) => (
            <p key={member}>
              {member}: ₹{balances[member].toFixed(2)}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
