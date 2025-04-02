import React from 'react'
import { Navbar } from '../components/Navbar'
import { Outlet } from 'react-router-dom'

export const BaseLayout:React.FC = () => {
  return (
    <>
    <Navbar />
    <Outlet /> 
    </>

  )
}
