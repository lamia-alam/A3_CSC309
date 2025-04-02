import { Route, Routes } from "react-router-dom";
import { Pages } from "./constants/pages";
import { Home } from "./pages/Home";
import { Account } from "./pages/Account";
import { Events } from "./pages/Events";
import { Promotions } from "./pages/Promotions";
import { Transactions } from "./pages/Transactions";
import { Users } from "./pages/Users";
import { BaseLayout } from "./layout/BaseLayout";
import { Login } from "./pages/Login";
import {
  ProtectedRoutes,
  UnauthenticatedRoutes,
} from "./components/ProtectedRoutes";

function App() {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route element={<ProtectedRoutes />}>
          <Route path={Pages.ACCOUNT} element={<Account />} />
          <Route path={Pages.EVENTS} element={<Events />} />
          <Route path={Pages.PROMOTIONS} element={<Promotions />} />
          <Route path={Pages.TRANSACTIONS} element={<Transactions />} />
          <Route path={Pages.USERS} element={<Users />} />
        </Route>
        <Route element={<UnauthenticatedRoutes />}>
          <Route path={Pages.LOGIN} element={<Login />} />
          <Route path={Pages.HOME} element={<Home />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
