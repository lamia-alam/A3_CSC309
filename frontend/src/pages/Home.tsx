import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const Home: React.FC = () => {
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  if (!userInfo) {
    return (
      <div className="text-center mt-10 text-xl text-gray-600">
        Loading...
      </div>
    );
  }

  const Card = ({ title, description, link }: { title: string; description: string; link: string }) => (
    <div
      onClick={() => navigate(link)}
      className="cursor-pointer bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition duration-200"
    >
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white py-12 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-700 mb-10 text-center">
          Welcome, {userInfo.name || userInfo.utorid}!
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Regular User */}
          {userInfo.role === "regular" && (
            <>
              <Card
                title="My Points"
                description={`You have ${userInfo.points} points.`}
                link="/account"
              />
              <Card
                title="View My Transactions"
                description="See your full transaction history."
                link="/transactions"
              />
            </>
          )}

          {/* Cashier */}
          {userInfo.role === "cashier" && (
            <Card
              title="Transactions"
              description="Create and process transactions."
              link="/transactions"
            />
          )}

          {/* Manager / Superuser */}
          {(userInfo.role === "manager" || userInfo.role === "superuser") && (
            <>
              <Card
                title="Manage Users"
                description="View and manage platform users."
                link="/users"
              />
              <Card
                title="Promotions"
                description="View or create promotional campaigns."
                link="/promotions"
              />
              <Card
                title="Events"
                description="Create or manage events and attendance."
                link="/events"
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
