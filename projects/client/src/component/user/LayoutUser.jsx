import React, { useEffect, useState } from 'react'
import axios from 'axios'
import NavbarTop from '../NavbarTop'
import BottomNavbar from '../NavbarBottom'
import Footer from '../Footer'

export default function LayoutUser(props) {
  const [city, setCity] = useState("")
  const [province, setProvince] = useState("")
  const token = localStorage.getItem("token")

  const getAddress = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/users/main-address`, {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      })
      if (response.data) {
        setCity(response.data.data?.City?.city_name)
        setProvince(response.data.data?.City?.Province?.province_name)
      }
    } catch (error) {
      console.error(error)
      if (error.response) {
        console.error(error.response.message)
      }
    }
  }

  useEffect(() => {
    getAddress()
  }, [])
  return (
    <div className='w-full min-h-screen flex flex-col'>
      <NavbarTop city={city} province={province} />
      <div className="w-full flex flex-grow justify-center mb-20 2xl:mt-10">
        <div className="w-full sm:max-w-3xl flex justify-center">
          {props.children}
        </div>
      </div>
      <BottomNavbar />
      <Footer />
    </div>
  )
}
