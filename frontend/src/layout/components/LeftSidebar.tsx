import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HomeIcon, Link } from "lucide-react";

const LeftSidebar= ()=>{
  return (
    <div className="h-full flex flex-col gap-2">
      {/* Navigation sec*/}
      <div className="rounded-lg bg-zinc-900 p-4">
        <div className="space-y-2">
          <Link to={"/"} 
          className= {cn
            (buttonVariants({
              variant:"ghost",
              className="w-full justify-start text-white hover:bg-zinc-800",
            })
          )}
          >
          <HomeIcon className="mr-3 size-5"/>
          <span className="hidden md:inline">Home</span>
          </Link>
        </div>
      </div>
      {/*Library sec */}
    </div>
  )
};
export default LeftSidebar;