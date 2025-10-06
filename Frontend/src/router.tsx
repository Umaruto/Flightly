import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Header from "./components/Header";
import SearchResults from "./pages/SearchResults";
import FlightDetails from "./pages/FlightDetails";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import UserDashboard from "./pages/Dashboard/UserDashboard";
import CompanyFlights from "./pages/CompanyDashboard/FlightsList";
import CompanyFlightForm from "./pages/CompanyDashboard/FlightForm";
import CompanyPassengers from "./pages/CompanyDashboard/Passengers";
import CompanyStats from "./pages/CompanyDashboard/Stats";
import AdminUsers from "./pages/Admin/Users";
import AdminCompanies from "./pages/Admin/Companies";
import AdminContent from "./pages/Admin/Content";
import AdminStats from "./pages/Admin/Stats";
import Footer from "./components/Footer";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/flights/:id" element={<FlightDetails />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/company/flights" element={<CompanyFlights />} />
        <Route path="/company/flights/new" element={<CompanyFlightForm />} />
        <Route
          path="/company/flights/:id/edit"
          element={<CompanyFlightForm />}
        />
        <Route
          path="/company/flights/:id/passengers"
          element={<CompanyPassengers />}
        />
        <Route path="/company/stats" element={<CompanyStats />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/stats" element={<AdminStats />} />
        <Route path="/admin/companies" element={<AdminCompanies />} />
        <Route path="/admin/content" element={<AdminContent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
}
