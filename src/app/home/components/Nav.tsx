import React from 'react';

interface NavProps {
    active: string;
    setActive: React.Dispatch<React.SetStateAction<string>>;
}

const Nav: React.FC<NavProps> = ({active,setActive}) => {
    return (
        <nav className="flex w-full items-center justify-center" role="navigation">
            <div className='max-w-sm w-full flex justify-between mx-5 bg-gray-100 my-5 rounded-full px-10 items-center p-5'>
            
                <button onClick={()=>setActive("HeartRate")}><img src="/icons/HeartRate.svg" alt="HeartRate" className={`h-10 ${active==="HeartRate"?"bg-red-100 border border-red-400":"bg-white border-white"} cursor-pointer hover:scale-110 transition duration-200 ease-in-out p-1 rounded-full`} /></button>
                <button onClick={()=>setActive("Temperature")}><img src="/icons/Temperature.svg" alt="Temperature" className={`h-10 ${active==="Temperature"?"bg-orange-100 border border-orange-400":"bg-white border-white"} cursor-pointer hover:scale-110 transition duration-200 ease-in-out p-1 rounded-full`}  /></button>
                <button onClick={()=>setActive("Hydration")}><img src="/icons/Hydration.svg" alt="Hydration" className={`h-10 ${active==="Hydration"?"bg-blue-100 border border-blue-400":"bg-white border-white"} cursor-pointer hover:scale-110 transition duration-200 ease-in-out p-1 rounded-full`}  /></button>
                <button onClick={()=>setActive("PH")}><img src="/icons/PH.svg" alt="PH" className={`h-10 ${active==="PH"?"bg-purple-100 border border-purple-400":"bg-white border-white"} cursor-pointer hover:scale-110 transition duration-200 ease-in-out p-1 rounded-full`}  /></button>
                <button onClick={()=>setActive("SPO2")}><img src="/icons/SPO2.svg" alt="PH" className={`h-10 ${active==="SPO2"?"bg-purple-100 border border-purple-400":"bg-white border-white"} cursor-pointer hover:scale-110 transition duration-200 ease-in-out p-1 rounded-full`}  /></button>
                <button onClick={()=>setActive("BodyTemperature")}><img src="/icons/BodyTemperature.svg" alt="Temperature" className={`h-10 ${active==="BodyTemperature"?"bg-orange-100 border border-orange-400":"bg-white border-white"} cursor-pointer hover:scale-110 transition duration-200 ease-in-out p-1 rounded-full`}  /></button>
            </div>
            
            
        </nav>
    );
};

export default Nav;