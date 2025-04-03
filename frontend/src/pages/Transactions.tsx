import React, {useContext, useEffect} from 'react'
import {api} from "../config/api.ts";
import "../style.css"
import {AuthContext} from "../context/AuthContext.tsx";

export const Transactions:React.FC = () => {
  const [trans, setTrans] = React.useState([])
  const { userInfo } = useContext(AuthContext);
  const [userMap, setUserMap] = React.useState(new Map<string, string>())

  const fetchTransactions = async () => {
    if (userInfo !== null && ["regular", "cashier"].includes(userInfo.role)) {
      return await api.get("/users/me/transactions");
    } else if (userInfo !== null && ["manager", "superuser"].includes(userInfo.role)) {
      return await api.get("/transactions");
    }
  }

  const fetchUsers = async () => {
    return await api.get("/users")
  }

  useEffect(() => {
    fetchTransactions().then(res => {
      setTrans(res?.data.results)
    })
    fetchUsers().then(res => {
      const map = new Map<string, string>()
      res.data.results.forEach((user: { utorid: string; name: string; }) => {
        map.set(user.utorid, user.name)
      })
      setUserMap(map)
    })
  }, []);

  return (
      <div className="grid grid-cols-3 gap-4 bg-base-300 p-3 ">
        {trans.map(transaction => {
        return (
            <div className="card bg-base-100 w-96 shadow-sm">
              <div className="card-body">
                {transaction["suspicious"] === true && <span className="badge badge-xs badge-warning">Suspicious</span>}
                <h2 className="card-title">
                  Transaction {transaction['id']}
                  <div className={`badge badge-secondary badgeColor-${transaction['type']}`}>{String(transaction['type']).toUpperCase()}</div>
                </h2>
                <div className="divider"></div>
                <p>Notes: {transaction['remark']}</p>
                <p>Created by: {userMap.get(transaction['createdBy'])}</p>
                <p>Customer: {userMap.get(transaction['utorid'])}</p>
                <p>Points Awarded: {transaction['amount']}</p>
                <p>Points Spent: {transaction['spent'] ?? 0}</p>
              </div>
            </div>
        )
        })}
      </div>
  )
}
