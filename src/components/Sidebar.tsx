import { Plus } from 'tabler-icons-react'
import { Logo } from '../components/logo'

export const Sidebar = () => {
    return (
      <div className="flex flex-col space-y-3 p-3 bg-slate-300 w-[300px] hidden md:flex">
        <Logo/>
        <div className="flex items-center justify-center h-[60px]">
          <button className="flex items-center w-full h-[40px] rounded-lg text-sm hover:bg-slate-400 border border-white">
            <Plus
              className="ml-4 mr-3"
              size={16}
            />
            New chat
          </button>
        </div>
  
        {/* <div className="flex-1"></div>
  
        <SidebarSettings
          lightMode={lightMode}
          onToggleLightMode={onToggleLightMode}
        /> */}
      </div>
    );
  };