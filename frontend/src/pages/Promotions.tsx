import React, {useContext, useEffect, useState} from 'react'
import {api} from "../config/api.ts";
import {AuthContext} from "../context/AuthContext.tsx";

export type FiltersState = {
  name: string;
  type: string;
  started: boolean;
  ended: boolean;
  description: string;
  minSpending: string;
  rate: string;
  points: string;
};

export const Promotions:React.FC = () => {
  const [promos, setPromos] = useState([])
  const [promoMap, setPromoMap] = useState(new Map<number, string>())
  const [promoToEdit, setPromoToEdit] = useState(-1)
  const [page, setPage] = useState(1)
  const [maxPage, setMaxPage] = useState(1)
  const [filters, setFilters] = useState<FiltersState>({
    name: "",
    type: "",
    description: "",
    started: false,
    ended: false,
    minSpending: "",
    rate: "",
    points: "",
  });
  const [promoToDelete, setPromoToDelete] = useState(-1)
  const {role} = useContext(AuthContext)
  const [form, setForm] = useState({name: "", description: "", type: "", startTime: "", endTime: "", minSpending: "", rate: "", points: ""})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
      if (["started", "ended"].includes(name)) {
        if (name === "started") {
          setFilters({...filters, started: !filters.started})
        } else {
          setFilters({...filters, ended: !filters.ended})
        }
      } else {
        setFilters((prev) => ({
          ...prev,
          [name]: value.toString(),
        }));
      }
  };

  const fetchPromotions = async (filters: any) => {
    if (filters["started"] === false) {
      delete filters["started"]
    }
    if (filters["ended"] === false) {
      delete filters["ended"]
    }
    return await api.get("/promotions", {params: filters})
  }

  const getPromotions = () => {
    fetchPromotions({...filters, page: page, limit: 10}).then(res => {
      setPromos(res?.data.results)
      const map = new Map<number, string>()
      res.data.results.forEach((promo: { id: number; name: string; }) => {
        map.set(promo.id, promo.name)
      })
      setPromoMap(map)
      setMaxPage(Math.ceil(res?.data.count/10))
    })
  }

  const setupDelete = (id: number) => {
    setPromoToDelete(id);
    (document.getElementById('my_modal_3') as HTMLDialogElement)?.showModal();
  }

  const submitForm = () => {
    const payload = {} as any
    payload.name = form.name
    payload.description = form.description
    payload.type = form.type
    payload.startTime = form.startTime
    payload.endTime = form.endTime
    payload.minSpending = form.minSpending
    payload.rate = form.rate
    payload.points = form.points
    let url;
    if (promoToEdit === -1) {
      url = "/promotions"
      api.post(url, payload).then(() => {
        alert("Promotion created successfully.");
        setForm({name: "", description: "", type: "", startTime: "", endTime: "",  minSpending: "", rate: "", points: ""})
        getPromotions()
        const checkbox = document.getElementById(
            "my-drawer-4"
        ) as HTMLInputElement;
        if (checkbox) checkbox.checked = false;
      }).catch(res => {
        alert(`Promotion not created: ${res.response.data.error}.`);
      })
    } else {
      url = `/promotions/${promoToEdit}`
      api.patch(url, payload).then(() => {
        alert("Promotion edited successfully.");
        setPromoToEdit(-1)
        setForm({name: "", description: "", type: "", startTime: "", endTime: "",  minSpending: "", rate: "", points: ""})
        getPromotions()
        const checkbox = document.getElementById(
            "my-drawer-4"
        ) as HTMLInputElement;
        if (checkbox) checkbox.checked = false;
      }).catch(res => {
        alert(`Promotion not edited: ${res.response.data.error}.`);
      })
    }
  }

  useEffect(() => {
    getPromotions()
  }, [filters, page]);

  const deletePromotion = () => {
    const url = `/promotions/${promoToDelete}`
    api.delete(url).then(() => {
      alert("Promotion deleted successfully.");
      setPromoToDelete(-1)
      getPromotions();
      (document.getElementById('my_modal_3') as HTMLDialogElement)?.close();
    }).catch(res => {
      alert(`Promotion not deleted: ${res.response.data.error}.`);
    })
  }

  return (
      <div className="drawer drawer-end">
        <input id="my-drawer-4" type="checkbox" className="drawer-toggle"/>
        <div className="drawer-content flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold">Promotions</h1>
            {role !== null && ["manager", "superuser"].includes(role) &&
                <label htmlFor="my-drawer-4" className="btn btn-primary hover:btn-secondary" onClick={() => {
                  setPromoToEdit(-1)
                  setForm({
                    name: "",
                    description: "",
                    type: "",
                    startTime: "",
                    endTime: "",
                    minSpending: "",
                    rate: "",
                    points: ""
                  })
                }}>
                  Create Promotion
                </label>}
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
              <tr>
                <th></th>
                <th>
                  <div className={"flex flex-col w-40"}>
                    Name
                  <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={filters.name}
                      onChange={handleChange}
                      className="border rounded h-6"
                  />
                  </div>
                </th>
                <th>
                  <div className={"flex flex-col"}>
                    Description
                    <input
                        type="text"
                        name="description"
                        placeholder="Description"
                        value={filters.description}
                        onChange={handleChange}
                        className="border rounded h-6"
                    />
                  </div>
                </th>
                <th>
                  <div className={"flex flex-col"}>
                    Type
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleChange}
                        className="border rounded h-6"
                    >
                      <option value="">Type</option>
                      <option value="one-time">One-Time</option>
                      <option value="automatic">Automatic</option>
                    </select>
                  </div>
                </th>
                <th>
                  <div className={"flex flex-col"}>
                    Start Time
                  <div className={"flex gap-3"}>
                    <input
                        type="checkbox"
                        name="started"
                        value={"true"}
                        disabled={filters.ended}
                        checked={filters.started}
                        onChange={handleChange}
                    /><h3>Started</h3>
                  </div>
                  </div>
                </th>
                <th>
                  <div className={"flex flex-col"}>
                    End Time
                    <div className={"flex gap-3"}>
                      <input
                          type="checkbox"
                          name="ended"
                          value={"true"}
                          disabled={filters.started}
                          checked={filters.ended}
                          onChange={handleChange}
                      /><h3>Ended</h3>
                    </div>
                  </div>
                </th>
                <th>
                  <div className={"flex flex-col w-30"}>
                    Min Spending
                    <input
                        type="number"
                        name="minSpending"
                        placeholder="Min Spending"
                        value={filters.minSpending}
                        onChange={handleChange}
                        className="border rounded h-6"
                    />
                  </div>
                </th>
                <th>
                  <div className={"flex flex-col w-13"}>
                    Rate
                    <input
                        type="number"
                        name="rate"
                        placeholder="Rate"
                        value={filters.rate}
                        onChange={handleChange}
                        className="border rounded h-6"
                    />
                  </div>
                </th>
                <th>
                  <div className={"flex flex-col w-15"}>
                    Points
                    <input
                        type="number"
                        name="points"
                        placeholder="Points"
                        value={filters.points}
                        onChange={handleChange}
                        className="border rounded h-6"
                    />
                  </div>
                </th>
                <th></th>
                <th></th>
              </tr>
              </thead>
              <tbody>
              {promos.map(promo => (<tr className="hover:bg-base-300">
                <th>{promo['id']}</th>
                <td>{promo['name']}</td>
                <td>{promo['description']}</td>
                <td>{String(promo['type']).charAt(0).toUpperCase() + String(promo['type']).slice(1)}</td>
                <td>{new Date(promo['startTime']).toUTCString().replace(" GMT", "")}</td>
                <td>{new Date(promo['endTime']).toUTCString().replace(" GMT", "")}</td>
                <td>{promo['minSpending']}</td>
                <td>{Math.round(Number(promo['rate']) * 100) / 100}</td>
                <td>{promo['points']}</td>
                <td>{role !== null && ["manager", "superuser"].includes(role) &&
                    <a className={"link link-primary hover:link-secondary"} onClick={() => {
                      setPromoToEdit(promo['id'])
                      setForm({
                        name: promo['name'],
                        description: promo['description'],
                        type: promo['type'],
                        startTime: String(promo['startTime']).replace("T", " ").replace("Z", ""),
                        endTime: String(promo['endTime']).replace("T", " ").replace("Z", ""),
                        minSpending: promo['minSpending'],
                        rate: promo['rate'],
                        points: promo['points']
                      })
                      const checkbox = document.getElementById(
                          "my-drawer-4"
                      ) as HTMLInputElement;
                      if (checkbox) checkbox.checked = true;
                    }}>Edit</a>}</td>
                <td>{role !== null && ["manager", "superuser"].includes(role) &&
                    <a className={"link link-primary hover:link-secondary"} onClick={() => setupDelete(promo['id'])}>Delete</a>}</td>
              </tr>))}
              </tbody>
            </table>
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
        <div className="drawer-side">
          <label htmlFor="my-drawer-4" aria-label="close sidebar" className="drawer-overlay"></label>
          <div className="menu bg-base-200 text-base-content min-h-full w-96 p-6">
            {/* Sidebar content here */}
            <h2 className="text-xl font-bold mb-4">{promoToEdit === -1 ? "Create New Promotion" : `Edit ${promoMap.get(promoToEdit)}`}</h2>
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
            <textarea
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
                {"Type"}
              </option>}
            </select>
            <h3 className="text-l font-bold mb-2">Start Time</h3>
            <input
                key={"startTime"}
                name={"startTime"}
                type={"datetime-local"}
                placeholder={"Start Time"}
                className="input input-bordered mb-2 w-full"
                value={(form as any).startTime}
                onChange={(e) => setForm({...form, startTime: e.target.value})}
            />
            <h3 className="text-l font-bold mb-2">End Time</h3>
            <input
                key={"endTime"}
                name={"endTime"}
                type={"datetime-local"}
                placeholder={"End Time"}
                className="input input-bordered mb-2 w-full"
                value={(form as any).endTime}
                onChange={(e) => setForm({...form, endTime: e.target.value})}
            />
            <h3 className="text-l font-bold mb-2">Min Spending</h3>
            <input
                key={"minSpending"}
                name={"minSpending"}
                type={"number"}
                placeholder={"Min Spending"}
                className="input input-bordered mb-2 w-full"
                value={(form as any).minSpending}
                onChange={(e) => setForm({...form, minSpending: e.target.value})}
            />
            <h3 className="text-l font-bold mb-2">Rate</h3>
            <input
                key={"rate"}
                name={"rate"}
                type={"number"}
                placeholder={"Rate"}
                className="input input-bordered mb-2 w-full"
                value={(form as any).rate}
                onChange={(e) => setForm({...form, rate: e.target.value})}
            />
            <h3 className="text-l font-bold mb-2">Points</h3>
            <input
                key={"points"}
                name={"points"}
                type={"number"}
                placeholder={"Points"}
                className="input input-bordered mb-2 w-full"
                value={(form as any).points}
                onChange={(e) => setForm({...form, points: e.target.value})}
            />
            <button className={"btn btn-primary hover:btn-secondary mt-4"} onClick={submitForm}>Submit</button>
          </div>
        </div>
        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <h3 className="font-bold text-lg">{`Are you sure you would like to delete ${promoMap.get(promoToDelete)}?`}</h3>
            <br/>
            <div className={"flex justify-end gap-1"}>
              <button className={"btn btn-primary hover:btn-secondary"} onClick={() => deletePromotion()}>Yes</button>
              <form method="dialog">
                <button className={"btn btn-secondary hover:btn-primary"}>No</button>
              </form>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
          <button>close</button>
          </form>
        </dialog>
      </div>
  )
}
