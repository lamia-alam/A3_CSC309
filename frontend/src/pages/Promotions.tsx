import React, {useEffect, useState} from 'react'
import {api} from "../config/api.ts";

export const Promotions:React.FC = () => {
  const [promos, setPromos] = useState([])
  const [promoToEdit, setPromoToEdit] = useState(-1)
  const [form, setForm] = useState({name: "", description: "", type: "", startTime: ""})

  const fetchPromotions = async () => {
    return await api.get("/promotions")
  }

  const getPromotions = () => {
    fetchPromotions().then(res => {
      setPromos(res?.data.results)
    })
  }

  useEffect(() => {
    getPromotions()
  }, []);

  return (
  <div className="drawer drawer-end">
    <input id="my-drawer-4" type="checkbox" className="drawer-toggle"/>
    <div className="drawer-content">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Promotions</h1>
        <label htmlFor="my-drawer-4" className="btn btn-primary" onClick={() => {
          setPromoToEdit(-1)
          setForm({name: "", description: "", type: "", startTime: ""})
        }}>
          Create Promotion
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Description</th>
            <th>Type</th>
            <th>Start Time</th>
            <th>End Time</th>
            <th>Min Spending</th>
            <th>Rate</th>
            <th>Points</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          {promos.map(promo => (<tr className="hover:bg-base-300">
            <th>{promo['id']}</th>
            <td>{promo['name']}</td>
            <td>{promo['description']}</td>
            <td>{String(promo['type']).charAt(0).toUpperCase() + String(promo['type']).slice(1)}</td>
            <td>{new Date(promo['startTime']).toUTCString()}</td>
            <td>{new Date(promo['endTime']).toUTCString()}</td>
            <td>{promo['minSpending']}</td>
            <td>{Math.round(Number(promo['rate'])*100)/100}</td>
            <td>{promo['points']}</td>
            <td><a className={"link link-primary hover:link-secondary"} onClick={() => {
              setPromoToEdit(promo['id'])
              console.log(promo['startTime'])
              setForm({name: promo['name'], description: promo['description'], type: promo['type'], startTime: String(promo['startTime']).replace("T", " ").replace("Z", "")})
              const checkbox = document.getElementById(
                  "my-drawer-4"
              ) as HTMLInputElement;
              if (checkbox) checkbox.checked = true;
            }}>Edit</a></td>
          </tr>))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="drawer-side">
      <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
      <div className="menu bg-base-200 text-base-content min-h-full w-96 p-6">
        {/* Sidebar content here */}
        <h2 className="text-xl font-bold mb-4">{promoToEdit === -1 ? "Create New Promotion" : `Edit Promotion ${promoToEdit}`}</h2>
        <h3 className="text-l font-bold mb-2">Name</h3>
        <input
            key={"name"}
            name={"name"}
            placeholder={"Name"}
            className="input input-bordered mb-2 w-full"
            value={(form as any).name}
            onChange={(e) => setForm({...form, name: e.target.value})}
        />
        <h3 className="text-l font-bold mb-2">Description</h3>
        <input
            key={"description"}
            name={"description"}
            placeholder={"Description"}
            className="input input-bordered mb-2 w-full"
            value={(form as any).description}
            onChange={(e) => setForm({...form, description: e.target.value})}
        />
        <h3 className="text-l font-bold mb-2">Type</h3>
        <select
            className="select select-bordered mb-4 w-full"
            value={form.type}
            onChange={(e) => setForm({...form, type: e.target.value})}
        >
          {["automatic", "one-time"].map((r) => (
              <option key={r} value={r}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
          ))}
          {promoToEdit === -1 && <option key={""} value={""}>
            {"None"}
          </option>}
        </select>
        <h3 className="text-l font-bold mb-2">Description</h3>
        <input
            key={"startTime"}
            name={"startTime"}
            type={"datetime-local"}
            placeholder={"Start Time"}
            className="input input-bordered mb-2 w-full"
            value={(form as any).startTime}
            onChange={(e) => setForm({...form, startTime: e.target.value})}
        />
      </div>
    </div>
  </div>
  )
}
