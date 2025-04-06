import React from 'react'

export const Promotions:React.FC = () => {
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
      {/* Page content here */}
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
