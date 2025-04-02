import { Route, Routes } from 'react-router-dom'
import { Pages } from './constants/pages'
import { Home } from './pages/Home'
import { Account } from './pages/Account'
import { Events } from './pages/Events'
import { Promotions } from './pages/Promotions'
import { Transactions } from './pages/Transactions'
import { Users } from './pages/Users'

function App() {

  return (
      <Routes>
        <Route path={Pages.HOME} element={<Home />} />
        <Route path={Pages.ACCOUNT} element={<Account />} />
        <Route path={Pages.EVENTS} element={<Events />} />
        <Route path={Pages.PROMOTIONS} element={<Promotions />} />
        <Route path={Pages.TRANSACTIONS} element={<Transactions />} />
        <Route path={Pages.USERS} element={<Users />} />
      </Routes>
  )
}

export default App
