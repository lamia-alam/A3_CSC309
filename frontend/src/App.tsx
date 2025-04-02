import { Route, Routes } from "react-router-dom";
import { Pages } from "./constants/pages";
import { Home } from "./pages/Home";
import { Account } from "./pages/Account";
import { Events } from "./pages/Events";
import { Promotions } from "./pages/Promotions";
import { Transactions } from "./pages/Transactions";
import { Users } from "./pages/Users";
import { BaseLayout } from "./layout/BaseLayout";

function App() {
  return (
    <Routes>
      <Route element={<BaseLayout />}>
        <Route path={Pages.HOME} element={<Home />} />
        <Route path={Pages.ACCOUNT} element={<Account />} />
        <Route path={Pages.EVENTS} element={<Events />} />
        <Route path={Pages.PROMOTIONS} element={<Promotions />} />
        <Route path={Pages.TRANSACTIONS} element={<Transactions />} />
        <Route path={Pages.USERS} element={<Users />} />
      </Route>
    </Routes>
  );
}

export default App;
