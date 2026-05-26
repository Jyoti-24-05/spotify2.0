// import { SignedIn,SignedOut, UserButton } from "@clerk/clerk-react";
// import { LayoutDashboardIcon } from "lucide-react";
// import { Link } from "react-router-dom";
// import SignInOAuthButtons from "./SignInOAuthButtons";
// import { useAuthStore } from "@/stores/useAuthStore";
// import { cn } from "@/lib/utils";
// import { buttonVariants } from "./ui/button";


// export default function Topbar() {
// 	const { isAdmin } = useAuthStore();
// 	console.log({ isAdmin });

// 	return (
// 		<div
// 			className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 
//       backdrop-blur-md z-10
//     '
// 		>
// 			<div className='flex gap-2 items-center'>
// 				<img src='/spotify.png' className='size-8' alt='Spotify logo' />
// 				Spotify
// 			</div>
// 			<div className='flex items-center gap-4'>
// 				{isAdmin && (
// 					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }))}>
// 						<LayoutDashboardIcon className='size-4  mr-2' />
// 						Admin Dashboard
// 					</Link>
// 				)}

// 				<SignedOut>
// 					<SignInOAuthButtons />
// 				</SignedOut>

// 				<UserButton />
// 			</div>
// 		</div>
// 	);
// };

import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { LayoutDashboardIcon } from "lucide-react";
import { Link } from "react-router-dom";
import SignInOAuthButtons from "./SignInOAuthButtons";
import { useAuthStore } from "@/stores/useAuthStore";
import { cn } from "@/lib/utils";
import { buttonVariants } from "./ui/button";
import { axiosInstance } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { YoutubeSearchDialog } from "@/pages/admin/components/YoutubeSearchDialog";

export default function Topbar() {
	const { isAdmin } = useAuthStore();

	const handleSongSelect = async (songData: any) => {
		try {
			await axiosInstance.post("/songs/youtube", songData);
			toast.success("Song added to library!");
		} catch (error: any) {
			console.error(error);
			toast.error(error.response?.data?.message || "Failed to add song");
		}
	};

	return (
		<div className='flex items-center justify-between p-4 sticky top-0 bg-zinc-900/75 backdrop-blur-md z-10'>
			<div className='flex gap-2 items-center'>
				<img src='/spotify.png' className='size-8' alt='Spotify logo' />
				<span className='hidden sm:inline'>Spotify</span>
			</div>

			<div className='flex items-center gap-4'>
				{/* Search is now available for all Signed In users */}
				<SignedIn>
					<YoutubeSearchDialog onSongSelect={handleSongSelect} />
				</SignedIn>

				{isAdmin && (
					<Link to={"/admin"} className={cn(buttonVariants({ variant: "outline" }), "hidden md:flex")}>
						<LayoutDashboardIcon className='size-4 mr-2' />
						Admin
					</Link>
				)}

				<SignedOut>
					<SignInOAuthButtons />
				</SignedOut>

				<UserButton />
			</div>
		</div>
	);
}