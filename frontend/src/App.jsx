import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';

// Shell & Navigation
import Navbar from './components/Navbar';

// Auth Pages
import Signup from './pages/Auth/Signup';
import Login from './pages/Auth/Login';
import Onboarding from './pages/Auth/Onboarding';

// Main Application Pages
import Dashboard from './pages/Dashboard/Dashboard';
import ListingsBrowse from './pages/Listings/ListingsBrowse';
import ListingNew from './pages/Listings/ListingNew';
import ListingDetail from './pages/Listings/ListingDetail';
import RequirementsList from './pages/Requirements/RequirementsList';
import RequirementNew from './pages/Requirements/RequirementNew';
import MatchesInbox from './pages/Matches/MatchesInbox';
import MatchDetail from './pages/Matches/MatchDetail';
import TradesList from './pages/Trades/TradesList';
import TradeDetail from './pages/Trades/TradeDetail';
import LogisticsDashboard from './pages/Logistics/LogisticsDashboard';
import ImpactReporting from './pages/Impact/ImpactReporting';
import AdminPanel from './pages/Admin/AdminPanel';
import OrgSettings from './pages/Settings/OrgSettings';

// B2B E-Commerce Pages
import ShortlistPage from './pages/Shortlist/ShortlistPage';
import CheckoutPage from './pages/Checkout/CheckoutPage';
import OrdersPage from './pages/Orders/OrdersPage';
import SellerInbox from './pages/Seller/SellerInbox';
import SellerListings from './pages/Seller/SellerListings';

import LandingPage from './pages/Landing/LandingPage';

// Layout wrapper to conditionally show Navbar
function AppShell() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isAuthPage = ['/signup', '/login', '/onboarding'].includes(location.pathname);

  return (
    <div className={isLandingPage ? "" : "min-h-screen bg-[#F5F5F7] text-black flex flex-col font-sans selection:bg-[#7201FF] selection:text-white"}>
      {!isAuthPage && !isLandingPage && <Navbar />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          
          {/* Auth & Onboarding */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />

          {/* Old Dashboard (Fully functional, reachable via direct URL, no redirect) */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Listings & Marketplace */}
          <Route path="/listings" element={<ListingsBrowse />} />
          <Route path="/listings/new" element={<ListingNew />} />
          <Route path="/listings/:id" element={<ListingDetail />} />

          {/* B2B Procurement E-Commerce Routes */}
          <Route path="/shortlist" element={<ShortlistPage />} />
          <Route path="/cart" element={<Navigate to="/shortlist" replace />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/:listingId" element={<CheckoutPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:orderId" element={<OrdersPage />} />

          {/* Seller Hub Routes */}
          <Route path="/seller/inbox" element={<SellerInbox />} />
          <Route path="/seller/listings" element={<SellerListings />} />

          {/* Requirements */}
          <Route path="/requirements" element={<RequirementsList />} />
          <Route path="/requirements/new" element={<RequirementNew />} />

          {/* Matches */}
          <Route path="/matches" element={<MatchesInbox />} />
          <Route path="/matches/:id" element={<MatchDetail />} />

          {/* Trades (also accessible via Orders) */}
          <Route path="/trades" element={<TradesList />} />
          <Route path="/trades/:id" element={<TradeDetail />} />

          {/* Revised Logistics Primary Dashboard Hub */}
          <Route path="/logistics" element={<LogisticsDashboard />} />
          <Route path="/logistics/load/:shipmentId" element={<Navigate to="/logistics" replace />} />

          {/* 3D Visual Surfaces & Reporting */}
          <Route path="/impact" element={<ImpactReporting />} />
          <Route path="/compliance" element={<Navigate to="/impact?view=compliance" replace />} />

          {/* Admin & Settings */}
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/settings/organisation" element={<OrgSettings />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/logistics" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AppProvider>
  );
}
