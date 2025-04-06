import React from 'react'

export const Promotions:React.FC = () => {
  return (
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Promotions</h1>
        <label htmlFor="create-promo-drawer" className="btn btn-primary">
          Create Promotion
        </label>
      </div>
  )
}
