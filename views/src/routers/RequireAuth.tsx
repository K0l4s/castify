import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import NotFoundPage from "../pages/informationPage/NotFoundPage";

export const RequireAuth: React.FC<{ children: JSX.Element }> = ({ children }) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  
  if (!isAuthenticated) {
    return (
      <NotFoundPage/>
    )
  }

  return children;
};