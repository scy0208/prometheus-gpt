


export const Logo = () => {
    return (
        <div className="relative flex items-center">
         <img src="/logo.png" alt="" className="w-12 h-12 rounded-full"/>
         <div className="flex flex-col leading-tight"> 
            <div className="text-2xl mt-1 flex items-center">
               <span className="text-gray-700 font-extrabold mr-3">AI-Sommelier</span>
            </div>
            <span className="text-gray-600  text-xs text-right mr-3">SpringSun Technologies LLC</span>
         </div>
      </div>
    )
}