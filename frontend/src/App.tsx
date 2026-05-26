import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { AuthenticateWithRedirectCallback } from "@clerk/clerk-react";
import MainLayout from "./layout/MainLayout";
import ChatPage from "./pages/chat/ChatPage";
import AlbumPage from "./pages/album/AlbumPage";
import AdminPage from "./pages/admin/AdminPage";

import { Toaster } from "react-hot-toast";
import NotFoundPage from "./pages/404/NotFoundPage";

import{useAuth} from "@clerk/clerk-react";
import { useEffect } from "react";
import { axiosInstance } from "./lib/axios";

function App() {
	const { getToken, isSignedIn } = useAuth();

  useEffect(() => {
    const updateToken = async () => {
      if (isSignedIn) {
        const token = await getToken();
        // Set the header for all future axios requests
        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      } else {
        delete axiosInstance.defaults.headers.common["Authorization"];
      }
    };

    updateToken();
  }, [isSignedIn, getToken]);

	return (
		<>
			<Routes>
				<Route
					path='/sso-callback'
					element={<AuthenticateWithRedirectCallback signUpForceRedirectUrl={"/auth-callback"} />}
				/>
				<Route path='/auth-callback' element={<AuthCallbackPage />} />
				<Route path='/admin' element={<AdminPage />} />

				<Route element={<MainLayout />}>
					<Route path='/' element={<HomePage />} />
					<Route path='/chat' element={<ChatPage />} />
					<Route path='/albums/:albumId' element={<AlbumPage />} />
					<Route path='*' element={<NotFoundPage />} />
				</Route>
			</Routes>
			<Toaster />
		</>
	);
}

export default App;