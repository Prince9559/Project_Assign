import { RouterProvider } from "react-router-dom";
import { appRouter } from "./routes/AppRoutes.jsx";
import ProfileCompletionBanner from "./components/banners/ProfileCompletionBanner";



const App = () => {
  return <RouterProvider router={appRouter} />;
};
export default App;
