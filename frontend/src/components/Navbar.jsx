import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Search,
  Bell,
  Settings,
  RefreshCw,
  X,
  User,
  ArrowRight,
  Handshake,
  Leaf,
  ShieldCheck,
  FileCheck,
  LogIn,
  UserPlus,
  Lock,
  LogOut,
  Building2,
  CheckCircle2,
  Sparkles,
  MapPin,
  Tag,
  ShoppingCart,
  Package,
  Inbox,
  Layers,
  Mail,
  Send,
} from 'lucide-react';
import { notificationsService } from '../services';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    org,
    notifications,
    setNotifications,
    listings,
    isLoggedIn,
    setIsLoggedIn,
    shortlist,
    orderRequests,
  } = useApp();

  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [emailStatus, setEmailStatus] = useState('');

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const notificationsRef = useRef(null);
  const settingsRef = useRef(null);

  // Center Navbar Items: Trades, Impact, Admin & Compliance have been moved into Settings
  const navItems = [
    { name: 'Dashboard', path: '/logistics' },
    { name: 'Marketplace', path: '/listings' },
    { name: 'Requirements', path: '/requirements' },
    { name: 'Matches', path: '/matches' },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Auto-focus search input when opened
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [showSearch]);

  // Handle click outside to close popovers
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSearch(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setShowSettings(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowSettings(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter listings based on search query
  const filteredListings = listings.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title?.toLowerCase().includes(q) ||
      item.materialType?.toLowerCase().includes(q) ||
      item.subType?.toLowerCase().includes(q) ||
      item.grade?.toLowerCase().includes(q) ||
      item.facilityName?.toLowerCase().includes(q) ||
      item.sellerOrg?.toLowerCase().includes(q)
    );
  });

  const targetEmail = 'xyz30102111@gmail.com';

  const passNotificationToEmail = (n) => {
    const subject = `[ReLoop Notification] ${n.title}`;
    const body = `ReLoop Platform Alert Notification\n\nTitle: ${n.title}\nTime: ${n.date || 'Just now'}\nDetails: ${n.desc}\nLink: ${window.location.origin}${n.link || '/logistics'}\n\nPassed to personal email: ${targetEmail}`;

    notificationsService.sendEmailNotification({
      to: targetEmail,
      title: n.title,
      desc: n.desc,
      link: n.link ? `${window.location.origin}${n.link}` : window.location.origin,
      date: n.date,
    });

    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');

    setEmailStatus(`Passed "${n.title}" to ${targetEmail}`);
    setTimeout(() => setEmailStatus(''), 4000);
  };

  const passAllNotificationsToEmail = () => {
    const subject = `[ReLoop Digest] ${notifications.length} Pending Actions & Alerts`;
    const body = `ReLoop Pending Alerts Digest\n\n${notifications
      .map(
        (n, i) =>
          `${i + 1}. ${n.title} (${n.date || 'Recent'})\n${n.desc}\nLink: ${window.location.origin}${n.link || ''}\n`
      )
      .join('\n----------------------------------------\n\n')}\nPassed to: ${targetEmail}`;

    notifications.forEach((n) => {
      notificationsService.sendEmailNotification({
        to: targetEmail,
        title: n.title,
        desc: n.desc,
        link: n.link ? `${window.location.origin}${n.link}` : window.location.origin,
        date: n.date,
      });
    });

    const mailtoUrl = `mailto:${targetEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');

    setEmailStatus(`Passed all alerts to ${targetEmail}`);
    setTimeout(() => setEmailStatus(''), 4000);
  };

  const actionBtnClass = (isOpen) =>
    `w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150 cursor-pointer relative select-none ${
      isOpen
        ? 'bg-black text-white border border-black shadow-xs'
        : 'bg-white border border-gray-200/90 text-gray-700 hover:text-black hover:border-[#7201FF] hover:bg-gray-50/90 shadow-2xs'
    }`;

  return (
    <header className="w-full bg-[#F5F5F7] px-6 pt-4 pb-2 border-b border-gray-200/60 sticky top-0 z-40 backdrop-blur-md">
      <div className="max-w-[1720px] mx-auto flex items-center justify-between">
        
        {/* Left: ReLoop Brand Logo */}
        <Link to="/logistics" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-black flex items-center justify-center shadow-xs group-hover:bg-[#7201FF] transition-colors">
            <RefreshCw className="w-4 h-4 text-white stroke-[2.5]" />
          </div>
          <div className="flex flex-col">
            <span className="text-[19px] font-extrabold tracking-tight text-black leading-none">
              ReLoop
            </span>
            <span className="text-[9.5px] font-semibold text-gray-700 tracking-wider uppercase mt-0.5">
              Circular Logistics
            </span>
          </div>
        </Link>

        {/* Center: Clean Navigation Pills (Dashboard, Listings, Requirements, Matches) */}
        <nav className="hidden md:flex items-center gap-1 bg-[#EBEBED]/70 p-1 rounded-full border border-gray-200/60">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`px-4 py-1.5 rounded-full text-[13px] font-semibold transition-all duration-200 flex items-center gap-1.5 select-none ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'text-gray-700 hover:text-black hover:bg-white/70'
                }`}
              >
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right: Only Search, Notification, and Setting (Same size & slightly bigger) */}
        <div className="flex items-center gap-2.5">
          
          {/* 1. Search Button & Functional Marketplace Search Popover */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => {
                setShowSearch(!showSearch);
                setShowNotifications(false);
                setShowSettings(false);
              }}
              title="Search Marketplace Listings"
              className={actionBtnClass(showSearch)}
            >
              <Search className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Functional Search Overlay / Popover */}
            {showSearch && (
              <div className="absolute right-0 mt-2.5 w-[92vw] sm:w-[480px] md:w-[520px] bg-white rounded-3xl shadow-floating border border-gray-200/90 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Search Input Field */}
                <div className="relative flex items-center mb-3">
                  <Search className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search marketplace items (rHDPE, rPET, OCC, Pallets, Rotterdam)..."
                    className="w-full pl-10 pr-9 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:outline-hidden focus:border-[#7201FF] focus:bg-white transition-all text-black placeholder-gray-400"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 p-1 rounded-full text-gray-400 hover:text-black hover:bg-gray-200 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Search Results Header */}
                <div className="flex items-center justify-between px-1 pb-2 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  <span>
                    {searchQuery.trim()
                      ? `Matching Listings (${filteredListings.length})`
                      : `Available Marketplace Lots (${listings.length})`}
                  </span>
                  {searchQuery && (
                    <span className="text-[#7201FF] font-semibold lowercase">
                      "{searchQuery}"
                    </span>
                  )}
                </div>

                {/* Filtered Marketplace Listings */}
                <div className="flex flex-col gap-1.5 mt-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {filteredListings.length > 0 ? (
                    filteredListings.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          navigate(`/listings/${item.id}`);
                          setShowSearch(false);
                          setSearchQuery('');
                        }}
                        className="p-3 rounded-2xl border border-gray-100 hover:border-[#7201FF] hover:bg-purple-50/30 transition-all cursor-pointer flex items-center justify-between gap-3 group"
                      >
                        <div className="flex items-center gap-3">
                          {/* Material Code Badge */}
                          <div className="w-10 h-10 rounded-xl bg-gray-100 group-hover:bg-[#7201FF] text-black group-hover:text-white flex items-center justify-center font-mono font-black text-xs transition-colors flex-shrink-0">
                            {item.materialType || 'LOT'}
                          </div>

                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-extrabold text-black group-hover:text-[#7201FF] transition-colors line-clamp-1">
                                {item.title}
                              </span>
                              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8FFE01] text-black flex-shrink-0">
                                {item.grade}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-[11px] text-gray-500 font-medium mt-0.5">
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-gray-400" />
                                {item.facilityName}
                              </span>
                              <span>•</span>
                              <span>{item.mass_kg?.toLocaleString()} kg</span>
                            </div>
                          </div>
                        </div>

                        {/* Price & Navigation Arrow */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-right">
                            <span className="text-xs font-black text-black block">
                              €{item.price_per_kg?.toFixed(2)}/kg
                            </span>
                            <span className="text-[10px] font-semibold text-emerald-700 block">
                              Available
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-[#7201FF] group-hover:translate-x-0.5 transition-all" />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center flex flex-col items-center justify-center gap-2">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-gray-700">
                        No marketplace items found matching "{searchQuery}"
                      </p>
                      <p className="text-[11px] text-gray-400 max-w-xs">
                        Try searching for materials like rHDPE, rPET, OCC bales, pallets, or locations like Rotterdam or Antwerp.
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer link to full marketplace browse */}
                <div className="pt-2.5 mt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-gray-400 text-[11px]">Press ESC to close</span>
                  <Link
                    to="/listings"
                    onClick={() => setShowSearch(false)}
                    className="font-bold text-[#7201FF] hover:underline flex items-center gap-1 text-xs"
                  >
                    <span>Browse All Marketplace Listings</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* 2. Shortlist Cart Button */}
          <Link
            to="/shortlist"
            title="Procurement Shortlist & Cart"
            className="w-11 h-11 rounded-2xl flex items-center justify-center transition-all duration-150 cursor-pointer relative bg-white border border-gray-200/90 text-gray-700 hover:text-black hover:border-[#7201FF] hover:bg-gray-50/90 shadow-2xs"
          >
            <ShoppingCart className="w-5 h-5 stroke-[2]" />
            {shortlist.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#7201FF] text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                {shortlist.length}
              </span>
            )}
          </Link>

          {/* 3. Notification Button with Drawer */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowSearch(false);
                setShowSettings(false);
              }}
              title="Notifications & Alerts"
              className={actionBtnClass(showNotifications)}
            >
              <Bell className="w-5 h-5 stroke-[2]" />
              {unreadCount > 0 && (
                <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2.5 w-80 sm:w-96 bg-white rounded-3xl shadow-floating border border-gray-200/90 p-3.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2.5 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#7201FF]" />
                    <span className="text-xs font-bold text-black">Pending Actions &amp; Alerts</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={passAllNotificationsToEmail}
                      title="Pass all alerts to xyz30102111@gmail.com"
                      className="text-[10px] text-emerald-700 bg-emerald-50 hover:bg-emerald-100 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Mail className="w-2.5 h-2.5" />
                      <span>Email to xyz30102111@gmail.com</span>
                    </button>
                    <span
                      onClick={() => {
                        if (setNotifications) {
                          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                        }
                      }}
                      className="text-[10px] text-[#7201FF] font-semibold cursor-pointer hover:underline"
                    >
                      Mark all read
                    </span>
                  </div>
                </div>

                {emailStatus && (
                  <div className="mt-2 p-2 rounded-xl bg-emerald-50 border border-emerald-200/60 text-emerald-800 text-[11px] font-semibold flex items-center gap-1.5 animate-in fade-in duration-150">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{emailStatus}</span>
                  </div>
                )}

                <div className="flex flex-col gap-2 mt-2 max-h-80 overflow-y-auto">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        passNotificationToEmail(n);
                        setShowNotifications(false);
                        navigate(n.link);
                      }}
                      className={`p-2.5 rounded-2xl border text-xs transition-colors block cursor-pointer group ${
                        n.unread
                          ? 'bg-purple-50/40 border-purple-100 hover:bg-purple-50/70'
                          : 'bg-gray-50/60 border-gray-100 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center justify-between font-semibold text-black mb-0.5">
                        <span className="truncate pr-1 font-bold">{n.title}</span>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span className="text-[10px] text-gray-500 font-normal">{n.date}</span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              passNotificationToEmail(n);
                            }}
                            title="Pass this alert to xyz30102111@gmail.com"
                            className="p-1 rounded-md hover:bg-white text-gray-400 hover:text-[#7201FF] border border-transparent hover:border-gray-200 transition-all cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <p className="text-[11.5px] text-gray-600 line-clamp-2 leading-tight">
                        {n.desc}
                      </p>
                      <div className="mt-1.5 pt-1 border-t border-gray-100/80 flex items-center justify-between text-[10px] text-gray-400">
                        <span>Click to view &amp; pass to email</span>
                        <span className="text-[#7201FF] font-medium flex items-center gap-1 group-hover:underline">
                          <Send className="w-2.5 h-2.5" /> Pass to xyz30102111@gmail.com
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 3. Setting Button & Dynamic Dropdown Menu */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => {
                setShowSettings(!showSettings);
                setShowSearch(false);
                setShowNotifications(false);
              }}
              title="Settings & Navigation"
              className={actionBtnClass(showSettings)}
            >
              <Settings className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Setting Dropdown Menu */}
            {showSettings && (
              <div className="absolute right-0 mt-2.5 w-72 sm:w-80 bg-white rounded-3xl shadow-floating border border-gray-200/90 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 flex flex-col gap-1.5">
                
                {/* BRANCH 1: Signed In View */}
                {isLoggedIn ? (
                  <>
                    {/* Profile Button at the Top */}
                    <button
                      onClick={() => {
                        navigate('/settings/organisation');
                        setShowSettings(false);
                      }}
                      className="w-full p-3 rounded-2xl bg-gray-50 hover:bg-purple-50/40 border border-gray-200/70 hover:border-purple-200 transition-all text-left flex items-center gap-3 group cursor-pointer"
                    >
                      <div className="relative flex-shrink-0">
                        <img
                          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                          alt="Profile"
                          className="w-10 h-10 rounded-full object-cover border border-white shadow-2xs group-hover:ring-2 group-hover:ring-[#7201FF] transition-all"
                        />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#8FFE01] border-2 border-white rounded-full"></span>
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-black group-hover:text-[#7201FF] transition-colors truncate">
                            {org.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 truncate">
                          {org.email}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mt-0.5">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Verified Organisation Profile</span>
                        </div>
                      </div>
                    </button>

                    {/* Divider */}
                    <div className="border-t border-gray-100 my-1"></div>

                    {/* Navigation Items Organized by Functional Areas */}
                    <div className="flex flex-col gap-1 max-h-[380px] overflow-y-auto pr-0.5">
                      
                      {/* Section 1: Procurement (Buyer) */}
                      <span className="text-[10px] font-extrabold uppercase text-gray-400 px-3 pt-1">
                        Procurement &amp; Purchasing
                      </span>

                      {/* Orders & History */}
                      <button
                        onClick={() => {
                          navigate('/orders');
                          setShowSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/80 transition-all flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-purple-50 text-[#7201FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#7201FF] group-hover:text-white transition-colors">
                            <Package className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-black block">My Orders &amp; History</span>
                            <span className="text-[10.5px] text-gray-500">Inquiries, counters &amp; status</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-all" />
                      </button>

                      {/* Shortlist Cart */}
                      <button
                        onClick={() => {
                          navigate('/shortlist');
                          setShowSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/80 transition-all flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                            <ShoppingCart className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-black block">Shortlist Cart</span>
                            <span className="text-[10.5px] text-gray-500">{shortlist.length} saved batches</span>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-purple-100 text-[#7201FF]">
                          {shortlist.length}
                        </span>
                      </button>

                      {/* Section 2: Seller Operations */}
                      <span className="text-[10px] font-extrabold uppercase text-gray-400 px-3 pt-2">
                        Seller Operations
                      </span>

                      {/* Seller Inbox */}
                      <button
                        onClick={() => {
                          navigate('/seller/inbox');
                          setShowSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/80 transition-all flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                            <Inbox className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-black block">Seller Order Inbox</span>
                            <span className="text-[10.5px] text-gray-500">Incoming buyer purchase orders</span>
                          </div>
                        </div>
                        {orderRequests.filter((r) => r.status === 'pending').length > 0 && (
                          <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-400 text-black">
                            {orderRequests.filter((r) => r.status === 'pending').length} new
                          </span>
                        )}
                      </button>

                      {/* Seller Listings */}
                      <button
                        onClick={() => {
                          navigate('/seller/listings');
                          setShowSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/80 transition-all flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                            <Layers className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-black block">My Posted Lots</span>
                            <span className="text-[10.5px] text-gray-500">Inventory &amp; feedstock management</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-all" />
                      </button>

                      {/* Section 3: Settlement & Governance */}
                      <span className="text-[10px] font-extrabold uppercase text-gray-400 px-3 pt-2">
                        Settlement &amp; Compliance
                      </span>

                      {/* Trades */}
                      <button
                        onClick={() => {
                          navigate('/trades');
                          setShowSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/80 transition-all flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-purple-50 text-[#7201FF] flex items-center justify-center flex-shrink-0 group-hover:bg-[#7201FF] group-hover:text-white transition-colors">
                            <Handshake className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-black block">Trades</span>
                            <span className="text-[10.5px] text-gray-500">Escrow, claims &amp; shipments</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-all" />
                      </button>

                      {/* Impact */}
                      <button
                        onClick={() => {
                          navigate('/impact');
                          setShowSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/80 transition-all flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                            <Leaf className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-black block">Impact</span>
                            <span className="text-[10.5px] text-gray-500">LCA carbon accounting &amp; ESG</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-all" />
                      </button>

                      {/* Admin */}
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setShowSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/80 transition-all flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-gray-100 text-gray-800 flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white transition-colors">
                            <ShieldCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-black block">Admin</span>
                            <span className="text-[10.5px] text-gray-500">Platform controls &amp; dispute desk</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-all" />
                      </button>

                      {/* Compliance */}
                      <button
                        onClick={() => {
                          navigate('/compliance');
                          setShowSettings(false);
                        }}
                        className="w-full px-3 py-2 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/80 transition-all flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileCheck className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-extrabold text-black block">Compliance</span>
                            <span className="text-[10.5px] text-gray-500">CSRD reports &amp; passports</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-400 group-hover:text-black transition-all" />
                      </button>

                    </div>

                    {/* Bottom Logout / Switch State */}
                    <div className="pt-2 mt-1 border-t border-gray-100 flex items-center justify-between px-1">
                      <button
                        onClick={() => {
                          setIsLoggedIn(false);
                          setShowSettings(false);
                        }}
                        className="text-[11px] font-bold text-gray-500 hover:text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                      <span className="text-[10px] text-gray-400">v2.4 Production</span>
                    </div>
                  </>
                ) : (
                  /* BRANCH 2: Not Signed In View (Signup, Login, Admin) */
                  <>
                    <div className="px-2 py-1.5 border-b border-gray-100">
                      <span className="text-xs font-extrabold text-black block">Account Access</span>
                      <span className="text-[11px] text-gray-500">Join or sign in to ReLoop Network</span>
                    </div>

                    <div className="flex flex-col gap-1 mt-1">
                      {/* Sign Up Button */}
                      <button
                        onClick={() => {
                          navigate('/signup');
                          setShowSettings(false);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-[#7201FF] hover:bg-purple-700 text-white transition-colors flex items-center justify-between group cursor-pointer text-left shadow-2xs"
                      >
                        <div className="flex items-center gap-3">
                          <UserPlus className="w-4 h-4 text-[#8FFE01]" />
                          <div>
                            <span className="text-xs font-extrabold block">Sign Up</span>
                            <span className="text-[10.5px] text-purple-200">Create organisation account</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      {/* Login Button */}
                      <button
                        onClick={() => {
                          navigate('/login');
                          setShowSettings(false);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl hover:bg-gray-50 border border-gray-200/80 transition-colors flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <LogIn className="w-4 h-4 text-black" />
                          <div>
                            <span className="text-xs font-extrabold text-black block">Log In</span>
                            <span className="text-[10.5px] text-gray-500">Access your workspace</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" />
                      </button>

                      {/* Admin Button */}
                      <button
                        onClick={() => {
                          navigate('/admin');
                          setShowSettings(false);
                        }}
                        className="w-full px-3.5 py-2.5 rounded-2xl hover:bg-gray-50 border border-transparent hover:border-gray-200/80 transition-colors flex items-center justify-between group cursor-pointer text-left"
                      >
                        <div className="flex items-center gap-3">
                          <Lock className="w-4 h-4 text-amber-600" />
                          <div>
                            <span className="text-xs font-extrabold text-black block">Admin</span>
                            <span className="text-[10.5px] text-gray-500">Platform administration portal</span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-black" />
                      </button>
                    </div>

                    {/* Quick Demo toggle */}
                    <div className="pt-2 mt-1 border-t border-gray-100 px-1 text-center">
                      <button
                        onClick={() => {
                          setIsLoggedIn(true);
                        }}
                        className="text-[10.5px] text-[#7201FF] hover:underline font-semibold cursor-pointer"
                      >
                        ⚡ Switch to Demo Logged-In Mode
                      </button>
                    </div>
                  </>
                )}

              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
