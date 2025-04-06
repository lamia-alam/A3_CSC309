import React, {useContext, useEffect, useState} from 'react'
import {api} from "../config/api.ts";
import "../style.css"
import {AuthContext} from "../context/AuthContext.tsx";
import TransactionFilters, {FiltersState} from "../components/TransactionFilters.tsx";
import Select from 'react-select';
type OptionType = { value: string; label: string };

export const Transactions:React.FC = () => {
  const [trans, setTrans] = React.useState([])
  const [page, setPage] = React.useState(1)
  const [maxPage, setMaxPage] = React.useState(1)
  const [recipient, setRecipient] = React.useState(-1)
  const { userInfo } = useContext(AuthContext);
  const [userIdMap, setUserIdMap] = React.useState(new Map<string, number>())
  const [userMap, setUserMap] = React.useState(new Map<string, string>())
  const [promotionMap, setPromotionMap] = React.useState(new Map<string, string>())
  const [transToUserMap, setTransToUserMap] = React.useState(new Map<string, string>())
  const [filters, setFilters] = React.useState({} as FiltersState)
  const [form, setForm] = useState({ type: "", spent: 0, amount: 0, remark: "", relatedId: "", utorid: "", promotionIds: [] as string[] });

  const fetchTransactions = async (filters: Object) => {
    if (userInfo !== null && ["regular", "cashier"].includes(userInfo.role)) {
      return await api.get("/users/me/transactions", { params: filters});
    } else if (userInfo !== null && ["manager", "superuser"].includes(userInfo.role)) {
      return await api.get("/transactions", { params: filters});
    }
  }

  const fetchUsers = async () => {
    return await api.get("/users")
  }

  const fetchPromotions = async () => {
    return await api.get("/promotions")
  }

  const getTransactions = () => {
    if (filters.createdBy !== "") {
      const key = [...userMap.entries()].find(([_k, v]) => v === filters.createdBy)?.[0];
      filters.createdBy = key ?? ""
    }
    fetchTransactions({...filters, page: page, limit: 6}).then(res => {
      setTrans(res?.data.results)
      setMaxPage(Math.ceil(res?.data.count/6))
      const map = new Map<string, string>()
      res?.data.results.forEach((transaction: { utorid: string; id: string; }) => {
        map.set(transaction.id.toString(), transaction.utorid)
      })
      setTransToUserMap(map)
    })
  }

  useEffect(() => {
    getTransactions()
  }, [filters, page]);

  useEffect(() => {
    fetchUsers().then(res => {
      const map = new Map<string, string>()
      const map2 = new Map<string, number>()
      res.data.results.forEach((user: { utorid: string; name: string; id: number; }) => {
        map.set(user.utorid, user.name)
        map2.set(user.utorid, user.id)
      })
      setUserMap(map)
      setUserIdMap(map2)
    })
  }, []);

  const options: OptionType[] = [...promotionMap.entries()].map(([key, label]) => ({
    value: key,
    label,
  }));

  const selectedValues = options.filter(option => form.promotionIds.includes(option.value));

  useEffect(() => {
    fetchPromotions().then(res => {
      const map = new Map<string, string>()
      res.data.results.forEach((promotion: { id: string; name: string; }) => {
        map.set(promotion.id, promotion.name)
      })
      setPromotionMap(map)
    })
  }, []);

  const submitForm = () => {
    var payload = {} as any
    var url = ""
    switch (form.type) {
      case "purchase":
        payload.utorid = form.utorid;
        payload.type = form.type;
        payload.spent = form.spent;
        payload.promotionIds = form.promotionIds;
        payload.remark = form.remark;
        url = "/transactions"
        break
      case "redemption":
        payload.type = form.type;
        payload.amount = form.amount;
        payload.remark = form.remark;
        url = "/users/me/transactions"
        break
      case "transfer":
        payload.type = form.type;
        payload.amount = form.amount;
        payload.remark = form.remark;
        url = `/users/${recipient}/transactions`
        break
      case "adjustment":
        payload.utorid = form.utorid;
        payload.type = form.type;
        payload.amount = form.amount;
        payload.relatedId = form.relatedId;
        payload.promotionIds = form.promotionIds;
        payload.remark = form.remark;
        url = "/transactions"
        break
    }
    api.post(url, payload).then(res => {
      if (res.status === 201) {
        alert("Transaction created successfully.");
        setForm({ type: "", spent: 0, amount: 0, remark: "", relatedId: "", utorid: "", promotionIds: [] as string[] })
        getTransactions()
        const checkbox = document.getElementById(
            "my-drawer"
        ) as HTMLInputElement;
        if (checkbox) checkbox.checked = false;
      } else {
        alert("Transaction not created.");
      }
    })
  }

  return (
      <div className="drawer drawer-end">
        <input id="my-drawer" type="checkbox" className="drawer-toggle"/>
        <div className="drawer-content">
          <div>
            <div className={"grid grid-cols-5"}>
              <TransactionFilters onFilterChange={filters => setFilters(filters)}/>
              <div className={"col-span-4 flex flex-col items-end"}>
                <label htmlFor="my-drawer" className="btn btn-primary drawer-button">Create Transaction</label>
                <div className="grid grid-cols-3 gap-3 auto-rows-min p-3 self-stretch ">
                  {trans.map(transaction => {
                    return (
                        <div className="card bg-gray-100 w-96 shadow-sm">
                          <div className="card-body">
                            {transaction["suspicious"] === true &&
                                <span className="badge badge-xs badge-warning">Suspicious</span>}
                            <h2 className="card-title">
                              Transaction {transaction['id']}
                              <div
                                  className={`badge badge-secondary badgeColor-${transaction['type']}`}>{String(transaction['type']).toUpperCase()}</div>
                            </h2>
                            <div className="divider m-1"></div>
                            <p>Notes: {transaction['remark']}</p>
                            <p>Created by: {userMap.get(transaction['createdBy'])}</p>
                            <p>Customer: {userMap.get(transaction['utorid'])}</p>
                            <p>Points Awarded: {transaction['amount']}</p>
                            <p>Points Spent: {transaction['spent'] ?? 0}</p>
                            {[...transaction["promotionIds"]]?.length !== 0 ?  <p>Promotions Applied:</p> : <p>{" "}</p> }
                            {[...transaction["promotionIds"]]?.length !== 0 ? [...transaction["promotionIds"]].map(key =>
                                <span className="badge badge-xs badge-secondary">{promotionMap.get(key)}</span>) : <p>{" "}</p>}
                          </div>
                        </div>
                    )
                  })}
                </div>
              </div>
            </div>
            <div className="join flex flex-row justify-end p-3">
            <button className="join-item btn btn-outline w-30" onClick={() => setPage(page - 1)}
                      disabled={page === 1}>Previous
              </button>
              <button className="join-item btn btn-outline w-30" onClick={() => setPage(page + 1)}
                      disabled={page === maxPage}>Next
              </button>
            </div>
          </div>
        </div>
        <div className="drawer-side">
          <label htmlFor="my-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu p-6 w-96 bg-base-200 text-base-content min-h-full">
            <h2 className="text-xl font-bold mb-4">Create New Transaction</h2>
            <h3 className="text-l font-bold mb-2">Type</h3>
            <select
                className="select select-bordered mb-4 w-full"
                value={form.type}
                onChange={(e) => setForm({...form, type: e.target.value})}
            >
              {["purchase", "adjustment", "redemption", "transfer"].map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1)}
                  </option>
              ))}
              <option key={""} value={""}>
                {"None"}
              </option>
            </select>
            {form.type === "purchase" && <>
              <h3 className="text-l font-bold mb-2">Spent</h3>
              <input
                  key={"spent"}
                  name={"spent"}
                  type={"number"}
                  className="input input-bordered mb-2 w-full"
                  value={(form as any).spent}
                  onChange={(e) => setForm({...form, spent: Number(e.target.value)})}
              />
              </>}
            {["adjustment", "redemption", "transfer"].includes(form.type) && <>
              <h3 className="text-l font-bold mb-2">Amount</h3>
              <input
                  key={"amount"}
                  name={"amount"}
                  type={"number"}
                  className="input input-bordered mb-2 w-full"
                  value={(form as any).amount}
                  onChange={(e) => setForm({...form, amount: Number(e.target.value)})}
              />
            </>}
              <h3 className="text-l font-bold mb-2">Remark</h3>
              <input
                  key={"remark"}
                  name={"remark"}
                  placeholder={"Remark"}
                  className="input input-bordered mb-2 w-full"
                  value={(form as any).remark}
                  onChange={(e) => setForm({...form, remark: e.target.value})}
              />
            {form.type === "adjustment" && <>
              <h3 className="text-l font-bold mb-2">Related Transaction</h3>
              <select
                  className="select select-bordered mb-4 w-full"
                  value={form.relatedId}
                  onChange={(e) => setForm({
                    ...form,
                    relatedId: e.target.value,
                    utorid: transToUserMap.get(e.target.value) ?? ""
                  })}
              >
                {trans.map((transaction) => (
                    <option key={transaction['id']} value={transaction['id']}>
                      {`Transaction ${transaction['id']}`}
                    </option>
                ))}
                <option key={""} value={""}>
                  {"None"}
                </option>
              </select>
            </>}
            {form.type !== "redemption" && <>
              <h3 className="text-l font-bold mb-2">Customer</h3>
            <select
                className="select select-bordered mb-4 w-full"
                value={form.utorid}
                disabled={form.type === "adjustment"}
                onChange={(e) => {
                  if (form.type === "transfer") {
                    setRecipient(userIdMap.get(e.target.value) || -1)
                  } else {
                    setForm({...form, utorid: e.target.value})}
                  }
                }
            >
              {[...userMap.keys()].map((r) => (
                  <option key={r} value={r}>
                    {userMap.get(r)}
                  </option>
              ))}
              <option key={""} value={""}>
                {"None"}
              </option>
            </select>
            </>}
            {!["redemption", "transfer"].includes(form.type) && <>
              <h3 className="text-l font-bold mb-2">Promotions</h3>
            <Select
                options={options}
                  isMulti
                  value={selectedValues}
                  onChange={(vals) => setForm({...form, promotionIds: vals.map(elem => elem.value) })}
                  placeholder="Promotions"
              />
            </>}
            <button className={"btn btn-primary mt-4"} onClick={submitForm}/>
          </div>
        </div>
      </div>
  )
}
