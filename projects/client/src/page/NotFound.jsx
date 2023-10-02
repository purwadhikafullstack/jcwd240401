import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import jwtDecode from 'jwt-decode'
import { keep, remove } from '../store/reducer/authSlice'
import { keepLoginAccount } from '../api/auth'
import background from '../assets/BackgroundLeaves.jpg'
import notFound from '../assets/NotFound.png'
import Button from '../component/Button'

export default function NotFound() {
    const token = localStorage.getItem("token")
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const location = useLocation()
    const profile = useSelector((state) => state.auth.profile)

    const keepLogin = async () => {
        let token = localStorage.getItem("token");
        if (token) {
          try {
            const response = await keepLoginAccount(token)
            if(response.status === 200){
              if (response.data.userId) {
              localStorage.setItem("token", response.data.refreshToken);
              const decoded = jwtDecode(token);
              dispatch(keep(decoded));
            }
          }
          } catch (error) {
            if(error.response.status === 401) {
              dispatch(remove())
              localStorage.removeItem("token")
              console.log(error)
              navigate("/login", { state: {from: location} })
            } else {
              console.log(error)
            }
          }
        }
      };

      if(token){
        keepLogin()
      }

    const goToHome = () => {
        if (profile.role === '1' || profile.role === '2') {
            navigate("/admin")
        } else {
            navigate("/")
        }
    }
    return (
        <>
            <div className="absolute w-full min-h-screen bg-cover bg-center flex flex-col justify-center items-center" style={{ backgroundImage: `url(${background})`, backgroundSize: 'cover' }}>
                <div className="w-80"><img src={notFound} alt="Error 404 Not Found" /></div>
                <div className="text-xl text-maingreen font-inter font-bold text-center">Sorry, the page you are looking for does not exist</div>
                <div className="w-72 mt-6">
                    <Button label={"Go To Home"} condition={"positive"} onClick={goToHome} />
                </div>
            </div>
        </>
    )
}

