import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
} from 'react-router-dom';

/* Components import */
import Navbar from './component/Navbar';
import Footer from './component/Footer';
import Create from './component/Create';
import Settings from './pages/Settings';
import StatsPage from './component/Stats';
import ProtectedRoute from "./component/ProtectedRoute";

/* Pages import */
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Browse from './pages/Browse'
import Product from './pages/Product';
import LangSelector from './component/LangSelector';
import Profile from './pages/Profile';
import NotFoundPage from './pages/NotFoundPage';
import Admin from './pages/Admin';




const Layout = ()=>{
return (
    <>
      <Navbar/>
      <Outlet/>
      <LangSelector/>
      <Footer/>
    </>
  )  
}


const AuthLayout = () => {
  return (
    <>
      <LangSelector />
      <Outlet />
    </>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: 'browse', element: <Browse /> },
      { path: 'settings', element: <Settings /> },
      { path: 'Stats', element: <StatsPage /> },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <Login /> },
      { path: '/register', element: <Register /> },
      { path: '/profile/:id', element: <Profile /> },
      { path: 'post/:postID', element: <Product /> },
      {
        path: "admin",
        element: (
          <ProtectedRoute allowedRoles={["0"]}>
            <Admin />
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '/Create', element: <Create /> },
  { path: '*', element: <NotFoundPage /> },
]);

function App() {


  return (
    <>
        <RouterProvider router={router} />
    </>
  )
}

export default App
