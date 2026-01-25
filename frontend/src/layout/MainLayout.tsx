import { Outlet } from "react-router-dom";
import {ResizablePanel,ResizablePanelGroup,} from "@/components/ui/resizable";

const MainLayout= ()=>{
  const isMobile =false;
  return <div className="h-screen bg-black text-white flex flex-col">
    <ResizablePanelGroup>

      {/*leftsidebar*/}
      <ResizablePanel defaultSize={20} minSize= {isMobile? 0:10} maxSize={30}>
        left Sidebar
      </ResizablePanel>

      {/*Main content*/}
      <ResizablePanel defaultSize={isMobile? 80:60}>
        <Outlet />
      </ResizablePanel>

      {/*rightsidebar*/}
      <ResizablePanel defaultSize={20} minSize={0} maxSize={25} collapseSize={0}>

      </ResizablePanel>

    </ResizablePanelGroup>

  </div>
};
export default MainLayout;