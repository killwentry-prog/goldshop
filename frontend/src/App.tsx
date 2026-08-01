import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Buy from './pages/Buy';
import ListingStep from './pages/ListingStep';
import OrderSuccess from './pages/OrderSuccess';
import Calculator from './pages/Calculator';
import Reviews from './pages/Reviews';
import Support from './pages/Support';
import Terms from './pages/Terms';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

export default function App() {
  return (
    <div className="mx-auto min-h-screen max-w-md pb-10">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/buy" element={<Buy />} />
        <Route path="/buy/listing" element={<ListingStep />} />
        <Route path="/buy/success" element={<OrderSuccess />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/support" element={<Support />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
}
