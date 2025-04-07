import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../config/api";

type User = { id: number; utorid: string; name: string; email: string; role: string; verified: boolean };
type Promotion = { id: number; name: string; description: string; points: number; startTime: string; endTime: string };
type Event = { id: number; name: string; location: string; startTime: string; endTime: string; published: boolean };
type Transaction = { id: number; type: string; spent?: number; amount: number; createdAt: string };

export const Home: React.FC = () => {
  const { userInfo, viewAsRole } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const role = viewAsRole || userInfo?.role;

  useEffect(() => {
    if (!userInfo || !role) return;

    if (role === "manager" || role === "superuser") {
      api.get("/users").then(res => setUsers(res.data.results)).catch(console.error);
      api.get("/promotions").then(res => setPromotions(res.data.results)).catch(console.error);
      api.get("/events").then(res => setEvents(res.data.results)).catch(console.error);
    }

    if (role === "regular" || role === "cashier") {
      api.get("/users/me/transactions?limit=5")
        .then(res => {
          const sorted = res.data.results.sort(
            (a: Transaction, b: Transaction) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          setTransactions(sorted);
        })
        .catch(console.error);
    }
  }, [userInfo, role]);

  if (!userInfo || !role) return <div className="text-center mt-10 text-xl text-gray-600">Loading...</div>;

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const totalUsers = users.length;
  const verifiedUsers = users.filter(u => u.verified).length;
  const roleCount = (r: string) => users.filter(u => u.role === r).length;

  const totalPromos = promotions.length;
  const activePromos = promotions.filter(p => new Date(p.startTime) <= now && now <= new Date(p.endTime)).length;
  const expiredPromos = promotions.filter(p => new Date(p.endTime) < now).length;
  const upcomingPromos = promotions.filter(p => new Date(p.startTime) > now).slice(0, 3);

  const totalEvents = events.length;
  const eventsToday = events.filter(e => new Date(e.startTime).toISOString().split("T")[0] === todayStr).length;
  const publishedEvents = events.filter(e => e.published).length;
  const unpublishedEvents = totalEvents - publishedEvents;

  const OverviewCard = ({
    title,
    stats,
    link,
  }: {
    title: string;
    stats: { label: string; value: string | number }[];
    link: string;
  }) => (
    <div
      onClick={() => navigate(link)}
      className="cursor-pointer bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-200"
    >
      <h2 className="text-xl font-bold mb-3">{title}</h2>
      <ul className="space-y-1">
        {stats.map((stat, i) => (
          <li key={i}>
            <span className="font-semibold text-purple-700">{stat.value}</span> {stat.label}
          </li>
        ))}
      </ul>
    </div>
  );

  const TransactionCard = () => (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
      <div className="max-h-64 overflow-y-auto pr-2">
        {transactions.length === 0 ? (
          <p className="text-gray-500">No transactions yet.</p>
        ) : (
          <ul className="space-y-3">
            {transactions.map(tx => (
              <li key={tx.id} className="border-b pb-2">
                <p className="text-sm text-gray-500">Transaction ID #{tx.id}</p>
                <p className="text-sm">Type: <span className="capitalize">{tx.type}</span></p>
                <p className="text-sm">Date: {new Date(tx.createdAt).toLocaleString()}</p>
                {tx.spent !== undefined && <p className="text-sm">Spent: ${tx.spent.toFixed(2)}</p>}
                <p className="text-sm">Points: {tx.amount}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-purple-700">
            Welcome, {userInfo.name || userInfo.utorid}!
          </h1>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {role === "regular" && (
            <>
              <OverviewCard title="My Points" stats={[{ label: "points available", value: userInfo.points }]} link="/account" />
              <TransactionCard />
            </>
          )}

          {role === "cashier" && (
            <OverviewCard
              title="Transactions Overview"
              stats={[
                { label: "Total transactions", value: transactions.length },
                { label: "Total points awarded", value: transactions.reduce((sum, tx) => sum + tx.amount, 0) },
                { label: "Total spent", value: "$" + transactions.reduce((sum, tx) => sum + (tx.spent || 0), 0).toFixed(2) },
              ]}
              link="/transactions"
            />
          )}

          {(role === "manager" || role === "superuser") && (
            <>
              <OverviewCard
                title="Users"
                stats={[
                  { label: "Total users", value: totalUsers },
                  { label: "Verified", value: verifiedUsers },
                  { label: "Superusers", value: roleCount("superuser") },
                  { label: "Managers", value: roleCount("manager") },
                  { label: "Cashiers", value: roleCount("cashier") },
                  { label: "Regular", value: roleCount("regular") },
                ]}
                link="/users"
              />
              <OverviewCard
                title="Promotions"
                stats={[
                  { label: "Total promotions", value: totalPromos },
                  { label: "Active", value: activePromos },
                  { label: "Expired", value: expiredPromos },
                  ...upcomingPromos.map(p => ({
                    label: `Upcoming: ${p.name}`,
                    value: new Date(p.startTime).toLocaleDateString(),
                  })),
                ]}
                link="/promotions"
              />
              <OverviewCard
                title="Events"
                stats={[
                  { label: "Total events", value: totalEvents },
                  { label: "Today", value: eventsToday },
                  { label: "Published", value: publishedEvents },
                  { label: "Unpublished", value: unpublishedEvents },
                ]}
                link="/events"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};