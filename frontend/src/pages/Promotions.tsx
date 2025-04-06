import React, {useEffect, useState} from 'react'
import {api} from "../config/api.ts";

export const Promotions:React.FC = () => {
  const [promos, setPromos] = useState([])

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
        <label htmlFor="my-drawer-4" className="btn btn-primary">
          Create Promotion
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="table">
          {/* head */}
          <thead>
          <tr>
            <th></th>
            <th>Name</th>
            <th>Job</th>
            <th>Favorite Color</th>
          </tr>
          </thead>
          <tbody>
          {promos.map(promo => (<tr>
            <th>{promo['id']}</th>
            <td>{promo['name']}</td>
            <td>{promo['description']}</td>
            <td>{promo['type']}</td>
            <td>{new Date(promo['startTime']).toUTCString()}</td>
            <td>{new Date(promo['endTime']).toUTCString()}</td>
            <td>{promo['minSpending']}</td>
            <td>{Math.round(Number(promo['rate'])*100)/100}</td>
            <td>{promo['points']}</td>
          </tr>))}
          </tbody>
        </table>
      </div>
    </div>
    <div className="drawer-side">
      <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
      <ul className="menu bg-base-200 text-base-content min-h-full w-80 p-4">
        {/* Sidebar content here */}
        <li><a>Sidebar Item 1</a></li>
        <li><a>Sidebar Item 2</a></li>
      </ul>
    </div>
  </div>
  )
}
