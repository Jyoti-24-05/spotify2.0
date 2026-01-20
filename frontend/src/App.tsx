import HomePage from "./pages/home/HomePage";
import AuthCallbackPage from "./pages/auth-callback/AuthCallbackPage";
import { Route, Routes } from "react-router-dom";


function App() {
  return (
    <>
       <Routes>
          <Route path= "/" element={<HomePage />} />
          <Route path= "/auth-callback" element={<AuthCallbackPage/>} />
       </Routes>
    </>
  );
}

export default App;

