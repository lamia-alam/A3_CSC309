import React from "react";
import { Pages } from "../constants/pages";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Menu = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return null;

  return (
    <>
      <li>
        <Link to={Pages.USERS}>Users</Link>
      </li>
      <li>
        <Link to={Pages.TRANSACTIONS}>Transactions</Link>
      </li>
      <li>
        <Link to={Pages.PROMOTIONS}>Promotions</Link>
      </li>
      <li>
        <Link to={Pages.EVENTS}>Events</Link>
      </li>
    </>
  );
};

export const Navbar: React.FC = () => {
  const { isAuthenticated, logout, userInfo } = useAuth();

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16"
              />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow"
          >
            <Menu />
          </ul>
        </div>
        <Link to={Pages.HOME} className="btn btn-ghost text-xl">
          daisyUI
        </Link>
      </div>

      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <Menu />
        </ul>
      </div>

      <div className="navbar-end">
        {isAuthenticated ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full bg-green-100 text-center pt-2 text-xl text-green-800">
                {userInfo?.avatarUrl ? (
                  <img src={userInfo.avatarUrl} className="rounded-full" />
                ) : (
                  (userInfo?.name ?? userInfo?.utorid)?.charAt(0).toUpperCase()
                )}
              </div>
            </label>
            <ul
              tabIndex={0}
              className="mt-3 z-[1] p-2 shadow menu menu-sm dropdown-content bg-base-200 rounded-box w-52"
            >
              <li>
                <Link to="/account-info">Update Account Info</Link>
              </li>
              <li>
                <Link to="/reset-password-manual">Change Password</Link>
              </li>
              <li>
                <button onClick={logout}>Logout</button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to={Pages.LOGIN} className="btn">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};