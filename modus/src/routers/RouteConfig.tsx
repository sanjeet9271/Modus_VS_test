import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import HomePage from "../pages/HomePage/HomePage.tsx";
import CallbackPage from "../pages/CallbackPage/CallbackPage.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/authenticated",
        element: <CallbackPage />,
      },
    ],
  },
]);

export default router;
