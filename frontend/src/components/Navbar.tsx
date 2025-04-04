import React from "react";
import { Pages } from "../constants/pages";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Menu = () => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return null;
  }
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
          <div className="flex items-center gap-3">
            <div className="avatar">
              <div className="mask mask-hexagon w-10 bg-green-100 text-center">
                {userInfo?.avatarUrl ? (
                  <img src={userInfo?.avatarUrl} />
                ) : (
                  <span className="text-3xl">
                    {(userInfo?.name ?? userInfo?.utorid)?.charAt(0)}
                  </span>
                )}
              </div>
            </div>
            <button className="btn" onClick={logout}>
              Logout
            </button>
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
