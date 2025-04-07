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
import { ResetPasswordLoggedIn } from "./pages/ResetPasswordLoggedIn";
import { ForgotPassword } from "./pages/forgotpassword";
import { AccountInfo } from "./pages/AccountInfo";
import { ResetLinkPassword } from "./pages/ResetLinkPassword";
import {
  ProtectedRoutes,
  UnauthenticatedRoutes,
} from "./components/ProtectedRoutes";
import { EventDetails } from "./pages/EventDetails";
import { MyEvents } from "./pages/MyEvents";

function App() {
  
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route element={<ProtectedRoutes />}>
          <Route path={Pages.HOME} element={<Home />} />
          <Route path={Pages.ACCOUNT} element={<Account />} />
          <Route path={Pages.EVENTS} element={<Events />} />
          <Route path={Pages.MYEVENTS} element={<MyEvents />} />
          <Route path={Pages.EVENTBYID} element={<EventDetails />} />
          <Route path={Pages.PROMOTIONS} element={<Promotions />} />
          <Route path={Pages.TRANSACTIONS} element={<Transactions />} />
          <Route path={Pages.USERS} element={<Users />} />
          <Route path="/account-info" element={<AccountInfo />} />
          <Route path="/reset-password-manual" element={<ResetPasswordLoggedIn />} />
        </Route>
        <Route element={<UnauthenticatedRoutes />}>
          <Route path={Pages.LOGIN} element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:resetToken" element={<ResetLinkPassword />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
