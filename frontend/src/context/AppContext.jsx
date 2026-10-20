import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  authService,
  listingsService,
  requirementsService,
  matchingService,
  commerceService,
  notificationsService,
  getAccessToken,
  setAccessToken,
} from '../services';

// Safe localStorage helpers
const getStorageItem = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (raw !== null && raw !== undefined) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Error reading ${key} from localStorage:`, err);
  }
  return fallback;
};

const setStorageItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`Error writing ${key} to localStorage:`, err);
  }
};

const AppContext = createContext();

export function AppProvider({ children }) {
  // Current Organisation State (persisted)
  const [org, setOrg] = useState(() =>
    getStorageItem('reloop_org_profile', {
      name: 'BioPolymer Labs Europe',
      legalName: 'BioPolymer Technologies B.V.',
      businessId: 'NL-884920194-B01',
      email: 'operations@biopolymerlabs.eu',
      verificationStatus: 'verified', // 'unverified' | 'documents_submitted' | 'verified'
      verificationThreshold: 15000, // EUR threshold for claiming trades when unverified
      capabilities: ['seller', 'buyer', 'carrier', 'recycler'], // multi-select
      permissions: {
        platform_admin: true,
        reporting: true,
      },
      primaryFacilityId: 1,
    })
  );

  useEffect(() => {
    setStorageItem('reloop_org_profile', org);
  }, [org]);

  // Auth Status State (persisted)
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    if (getAccessToken()) return true;
    const stored = localStorage.getItem('reloop_auth_state');
    if (stored !== null) return stored === 'true';
    return true; // default demo mode
  });

  useEffect(() => {
    localStorage.setItem('reloop_auth_state', String(isLoggedIn));
  }, [isLoggedIn]);

  const [backendSyncStatus, setBackendSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'connected' | 'offline'

  // Facilities
  const [facilities, setFacilities] = useState([
    {
      id: 1,
      name: 'Rotterdam Circular Hub (HQ)',
      address: 'Maashaven Zuidzijde 12, 3072 AE Rotterdam, Netherlands',
      lat: 51.9054,
      lng: 4.4842,
      isPrimary: true,
      capacityTons: 4500,
    },
    {
      id: 2,
      name: 'Antwerp Depot & Processing',
      address: 'Haven 1025, 2030 Antwerp, Belgium',
      lat: 51.2721,
      lng: 4.3879,
      isPrimary: false,
      capacityTons: 2800,
    },
    {
      id: 3,
      name: 'Duisburg Logistics Platform',
      address: 'Alte Ruhrorter Str. 42, 47119 Duisburg, Germany',
      lat: 51.4508,
      lng: 6.7411,
      isPrimary: false,
      capacityTons: 3200,
    },
  ]);

  // Notifications & Pending Actions (persisted)
  const [notifications, setNotifications] = useState(() =>
    getStorageItem('reloop_notifications', [
      {
        id: 'n1',
        type: 'match',
        title: 'New High-Score Match',
        desc: '94% composite match for 12,000kg Post-Consumer rPET Pellets (Rotterdam → Antwerp).',
        link: '/matches/m-101',
        date: '10m ago',
        unread: true,
      },
      {
        id: 'n2',
        type: 'route',
        title: 'Proposed Multi-Stop Route',
        desc: 'Route RT-882 awaits acceptance (Rotterdam → Breda → Antwerp). Est. Revenue: €1,850.',
        link: '/logistics',
        date: '1h ago',
        unread: true,
      },
      {
        id: 'n3',
        type: 'dispute',
        title: 'Dispute Response Window Closing',
        desc: 'Trade TR-4091 buyer reported moisture deviation. 14h left to submit counter-evidence.',
        link: '/trades/TR-4091',
        date: '3h ago',
        unread: false,
      },
    ])
  );

  useEffect(() => {
    setStorageItem('reloop_notifications', notifications);
  }, [notifications]);

  // Listings Collection
  const [listings, setListings] = useState([
    {
      id: 'L-101',
      title: 'Clean Post-Industrial rHDPE Regrind (Grade A)',
      materialType: 'rHDPE',
      subType: 'Rigid Blow-Molding Flakes',
      grade: 'Grade A',
      gradeSource: 'AI (Confidence 96%)',
      mass_kg: 18500,
      price_per_kg: 1.12,
      currency: '€',
      carbon_class: 'carbon_positive', // 'carbon_positive' | 'marginal' | 'carbon_negative'
      net_co2e_saved_kg: 24800,
      distance_km: 42,
      breakeven_radius_km: 320,
      facilityName: 'Rotterdam Circular Hub',
      sellerOrg: 'BioPolymer Labs Europe',
      isVerified: true,
      openToOffers: true,
      isAuction: false,
      available_from: '2026-09-15',
      available_until: '2026-10-15',
      unit_dimensions: '120x100x110 cm',
      unit_count: 24,
      photos: [
        'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      ],
      hotspots: [
        { id: 'h1', region: 'top_deck_left', type: 'Dust Contamination', severity: 'low', x: -0.4, y: 0.6, z: 0.2 },
        { id: 'h2', region: 'center_core', type: 'Uniform Density', severity: 'optimal', x: 0.0, y: 0.0, z: 0.0 },
      ],
    },
    {
      id: 'L-102',
      title: 'Clear Post-Consumer rPET Flakes (Hot Washed)',
      materialType: 'rPET',
      subType: 'Bottle-Grade Washed Flakes',
      grade: 'Grade A+',
      gradeSource: 'AI (Confidence 98%)',
      mass_kg: 26000,
      price_per_kg: 1.34,
      currency: '€',
      carbon_class: 'carbon_positive',
      net_co2e_saved_kg: 39500,
      distance_km: 78,
      breakeven_radius_km: 450,
      facilityName: 'Antwerp Depot',
      sellerOrg: 'Nordic Circular Materials',
      isVerified: true,
      openToOffers: false,
      isAuction: true,
      auctionClosing: '2026-09-14T18:00:00Z',
      leadingBid: 1.38,
      bidsCount: 7,
      photos: [
        'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      ],
      hotspots: [
        { id: 'h3', region: 'surface_rim', type: 'Trace Cap Polyolefins', severity: 'medium', x: 0.5, y: 0.4, z: -0.3 },
      ],
    },
    {
      id: 'L-103',
      title: 'Clean Industrial LDPE Stretch Film Bales',
      materialType: 'rLDPE',
      subType: '98/2 Transparent Film Bales',
      grade: 'Grade B+',
      gradeSource: 'Manual Override (Seller Confirmed)',
      mass_kg: 14200,
      price_per_kg: 0.78,
      currency: '€',
      carbon_class: 'marginal',
      net_co2e_saved_kg: 9200,
      distance_km: 145,
      breakeven_radius_km: 190,
      facilityName: 'Duisburg Platform',
      sellerOrg: 'Rheinland Recovery GmbH',
      isVerified: true,
      openToOffers: true,
      isAuction: false,
      photos: [
        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      ],
      hotspots: [],
    },
    {
      id: 'L-104',
      title: 'Mixed Post-Consumer Polypropylene Regrind',
      materialType: 'rPP',
      subType: 'Dark Co-Polymer Regrind',
      grade: 'Grade C',
      gradeSource: 'AI (Confidence 68% - Flagged)',
      mass_kg: 8500,
      price_per_kg: 0.42,
      currency: '€',
      carbon_class: 'carbon_negative',
      net_co2e_saved_kg: -1400,
      distance_km: 390,
      breakeven_radius_km: 85,
      facilityName: 'Frankfurt Hub',
      sellerOrg: 'Hessen Polymer Reprocessing',
      isVerified: false,
      openToOffers: true,
      isAuction: false,
      photos: [
        'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      ],
      hotspots: [
        { id: 'h4', region: 'base_left', type: 'High Ash Contaminant (4.2%)', severity: 'high', x: -0.3, y: -0.5, z: 0.2 },
      ],
    },
    {
      id: 'L-105',
      title: 'Baled OCC Corrugated Cardboard (Export Grade)',
      materialType: 'Cardboard',
      subType: 'OCC 11 Industrial Bales',
      grade: 'Grade A',
      gradeSource: 'AI (Confidence 95%)',
      mass_kg: 22000,
      price_per_kg: 0.24,
      currency: '€',
      carbon_class: 'carbon_positive',
      net_co2e_saved_kg: 18400,
      distance_km: 35,
      breakeven_radius_km: 290,
      facilityName: 'Rotterdam Circular Hub',
      sellerOrg: 'BioPolymer Labs Europe',
      isVerified: true,
      openToOffers: true,
      isAuction: false,
      photos: [
        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      ],
      hotspots: [],
    },
    {
      id: 'L-106',
      title: 'Heat-Treated Standard EPAL Euro Pallets',
      materialType: 'Pallets',
      subType: 'EPAL-1 1200x800mm Treated',
      grade: 'Grade A+',
      gradeSource: 'AI (Confidence 97%)',
      mass_kg: 11250,
      price_per_kg: 0.34,
      currency: '€',
      carbon_class: 'carbon_positive',
      net_co2e_saved_kg: 14600,
      distance_km: 55,
      breakeven_radius_km: 380,
      facilityName: 'Antwerp Depot',
      sellerOrg: 'Nordic Circular Materials',
      isVerified: true,
      openToOffers: false,
      isAuction: false,
      photos: [
        'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
      ],
      hotspots: [],
    },
    {
      id: 'L-107',
      title: 'Reconditioned 200L Steel Tight-Head Drums',
      materialType: 'Steel Drums',
      subType: 'UN-Certified 200L Tight Head',
      grade: 'Grade A',
      gradeSource: 'AI (Confidence 93%)',
      mass_kg: 9200,
      price_per_kg: 0.48,
      currency: '€',
      carbon_class: 'carbon_positive',
      net_co2e_saved_kg: 8900,
      distance_km: 68,
      breakeven_radius_km: 260,
      facilityName: 'Ghent Industrial Park',
      sellerOrg: 'Ghent Circular Solvents',
      isVerified: true,
      openToOffers: true,
      isAuction: false,
      photos: [
        'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=600&auto=format&fit=crop&q=80',
      ],
      hotspots: [],
    },
    {
      id: 'L-108',
      title: 'Heavy-Duty 4-Wall Corrugated Gaylord Boxes',
      materialType: 'Gaylords',
      subType: 'Triple-Wall Octagonal Bulk Box',
      grade: 'Grade A',
      gradeSource: 'AI (Confidence 94%)',
      mass_kg: 6400,
      price_per_kg: 0.72,
      currency: '€',
      carbon_class: 'carbon_positive',
      net_co2e_saved_kg: 7100,
      distance_km: 82,
      breakeven_radius_km: 210,
      facilityName: 'Duisburg Platform',
      sellerOrg: 'Rheinland Recovery GmbH',
      isVerified: true,
      openToOffers: true,
      isAuction: false,
      photos: [
        'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
      ],
      hotspots: [],
    },
  ]);

  // Requirements Collection (persisted)
  const [requirements, setRequirements] = useState(() =>
    getStorageItem('reloop_requirements', [
      {
        id: 'REQ-201',
        title: 'Weekly Sourcing: Bottle-Grade rPET Flakes',
        materialCategory: 'rPET',
        minGrade: 'Grade A',
        massPerPeriod: 25000,
        period: 'weekly',
        maxPrice: 1.40,
        useCarbonLimit: true,
        maxDistanceKm: null,
        status: 'active', // 'active' | 'paused'
        isStandingContract: false,
      },
      {
        id: 'REQ-202',
        title: 'Continuous High-Grade rHDPE Injection Pellets',
        materialCategory: 'rHDPE',
        minGrade: 'Grade A',
        massPerPeriod: 60000,
        period: 'monthly',
        maxPrice: 1.25,
        useCarbonLimit: false,
        maxDistanceKm: 250,
        status: 'active',
        isStandingContract: true,
        cadence: 'Bi-Weekly Monday Run',
        baselineVolume: 30000,
        recentVolume: 21500,
        driftAlert: true,
        driftText: 'Actual volume is -28.3% below baseline over last 2 cycles.',
      },
    ])
  );

  useEffect(() => {
    setStorageItem('reloop_requirements', requirements);
  }, [requirements]);

  // Ranked Matches (Top 8 for logged-in org)
  const [matches, setMatches] = useState([
    {
      id: 'm-101',
      listingId: 'L-101',
      title: 'rHDPE Regrind Grade A ↔ Rotterdam Processing',
      material: 'rHDPE Flakes',
      code: 'rHDPE',
      distance_km: 42,
      carbon_class: 'carbon_positive',
      composite_score: 96,
      reasonText: 'Exceptional geographic proximity (<50km) and exact melt flow index match with zero moisture penalty.',
      breakdown: {
        semantic_similarity: 96,
        grade_fit: 98,
        price_fit: 94,
        carbon_score: 97,
        timing_fit: 92,
        gross_avoided_kg: 32000,
        reprocess_kg: 5200,
        transport_kg: 2000,
        net_saved_kg: 24800,
        breakeven_radius_km: 320,
        assumed_load_factor: 88,
        factor_version: 'v2.4-GHG-Protocol',
      },
    },
    {
      id: 'm-102',
      listingId: 'L-102',
      title: 'Clear rPET Washed Flakes ↔ Antwerp Bottle Extruder',
      material: 'rPET Washed',
      code: 'rPET',
      distance_km: 78,
      carbon_class: 'carbon_positive',
      composite_score: 94,
      reasonText: 'Direct rail corridor alignment gives high net CO₂e savings despite slight grade premium.',
      breakdown: {
        semantic_similarity: 92,
        grade_fit: 96,
        price_fit: 91,
        carbon_score: 95,
        timing_fit: 88,
        gross_avoided_kg: 48000,
        reprocess_kg: 6000,
        transport_kg: 2500,
        net_saved_kg: 39500,
        breakeven_radius_km: 450,
        assumed_load_factor: 92,
        factor_version: 'v2.4-GHG-Protocol',
      },
    },
    {
      id: 'm-103',
      listingId: 'L-105',
      title: 'Baled OCC Corrugate ↔ Paperboard Packaging',
      material: 'OCC Bales',
      code: 'OCC',
      distance_km: 35,
      carbon_class: 'carbon_positive',
      composite_score: 92,
      reasonText: 'Local pickup with zero backhaul penalty, directly satisfying quarterly fiber packaging requirements.',
      breakdown: {
        semantic_similarity: 94,
        grade_fit: 95,
        price_fit: 93,
        carbon_score: 91,
        timing_fit: 90,
        gross_avoided_kg: 24000,
        reprocess_kg: 3600,
        transport_kg: 2000,
        net_saved_kg: 18400,
        breakeven_radius_km: 290,
        assumed_load_factor: 90,
        factor_version: 'v2.4-GHG-Protocol',
      },
    },
    {
      id: 'm-104',
      listingId: 'L-106',
      title: 'Standard EPAL Pallets ↔ Regional Logistics Hub',
      material: 'Euro Pallets',
      code: 'Pallets',
      distance_km: 55,
      carbon_class: 'carbon_positive',
      composite_score: 89,
      reasonText: 'Certified heat-treated EPAL specification with high reuse cycle lifespan.',
      breakdown: {
        semantic_similarity: 91,
        grade_fit: 97,
        price_fit: 88,
        carbon_score: 87,
        timing_fit: 86,
        gross_avoided_kg: 19000,
        reprocess_kg: 2200,
        transport_kg: 2200,
        net_saved_kg: 14600,
        breakeven_radius_km: 380,
        assumed_load_factor: 85,
        factor_version: 'v2.4-GHG-Protocol',
      },
    },
    {
      id: 'm-105',
      listingId: 'L-103',
      title: 'Clean Industrial LDPE Stretch ↔ Film Recycler',
      material: 'LDPE Film',
      code: 'rLDPE',
      distance_km: 145,
      carbon_class: 'marginal',
      composite_score: 87,
      reasonText: 'High transparency film bales with minimal color contamination; acceptable transport radius.',
      breakdown: {
        semantic_similarity: 88,
        grade_fit: 89,
        price_fit: 90,
        carbon_score: 85,
        timing_fit: 84,
        gross_avoided_kg: 14000,
        reprocess_kg: 2800,
        transport_kg: 2000,
        net_saved_kg: 9200,
        breakeven_radius_km: 190,
        assumed_load_factor: 84,
        factor_version: 'v2.4-GHG-Protocol',
      },
    },
    {
      id: 'm-106',
      listingId: 'L-107',
      title: 'Reconditioned Steel Drums ↔ Chemical Industrial',
      material: 'Steel Drums',
      code: 'Drums',
      distance_km: 68,
      carbon_class: 'carbon_positive',
      composite_score: 84,
      reasonText: 'UN-certified tight head containers ready for closed-loop industrial refilling.',
      breakdown: {
        semantic_similarity: 86,
        grade_fit: 91,
        price_fit: 82,
        carbon_score: 84,
        timing_fit: 83,
        gross_avoided_kg: 12000,
        reprocess_kg: 1500,
        transport_kg: 1600,
        net_saved_kg: 8900,
        breakeven_radius_km: 260,
        assumed_load_factor: 82,
        factor_version: 'v2.4-GHG-Protocol',
      },
    },
    {
      id: 'm-107',
      listingId: 'L-108',
      title: 'Triple-Wall Gaylords ↔ Automotive Parts Sourcing',
      material: 'Gaylord Boxes',
      code: 'Gaylords',
      distance_km: 82,
      carbon_class: 'carbon_positive',
      composite_score: 82,
      reasonText: 'Structural integrity intact for heavy bulk part storage, displacing virgin fiber manufacturing.',
      breakdown: {
        semantic_similarity: 85,
        grade_fit: 89,
        price_fit: 84,
        carbon_score: 80,
        timing_fit: 80,
        gross_avoided_kg: 10000,
        reprocess_kg: 1300,
        transport_kg: 1600,
        net_saved_kg: 7100,
        breakeven_radius_km: 210,
        assumed_load_factor: 80,
        factor_version: 'v2.4-GHG-Protocol',
      },
    },
    {
      id: 'm-108',
      listingId: 'L-104',
      title: 'Mixed Polypropylene Regrind ↔ Non-Structural Molding',
      material: 'PP Regrind',
      code: 'rPP',
      distance_km: 390,
      carbon_class: 'carbon_negative',
      composite_score: 79,
      reasonText: 'Feedstock compatible with dark utility products; haulage exceeds optimal break-even threshold.',
      breakdown: {
        semantic_similarity: 78,
        grade_fit: 75,
        price_fit: 92,
        carbon_score: 78,
        timing_fit: 76,
        gross_avoided_kg: 8000,
        reprocess_kg: 4400,
        transport_kg: 5000,
        net_saved_kg: -1400,
        breakeven_radius_km: 85,
        assumed_load_factor: 75,
        factor_version: 'v2.4-GHG-Protocol',
      },
    },
  ]);

  // Trades & Escrow (persisted)
  const [trades, setTrades] = useState(() =>
    getStorageItem('reloop_trades', [
      {
        id: 'TR-4091',
        listingId: 'L-101',
        material: 'rHDPE Rigid Blow-Molding Flakes',
        mass_kg: 18500,
        agreedPrice: 1.10,
        totalValue: 20350,
        currency: '€',
        counterpartOrg: 'Nordic Packaging NV',
        status: 'in-transit', // 'claimed' | 'accepted' | 'logistics_assigned' | 'in-transit' | 'delivered' | 'closed' | 'disputed'
        stepIndex: 3, // 0 to 5
        escrow_state: 'held', // 'pending' | 'held' | 'released' | 'disputed'
        pickupFacility: 'Rotterdam Circular Hub',
        deliveryFacility: 'Ghent Industrial Park',
        shipmentId: 'SH-8821',
        deliveredAt: null,
        disputeCountdownHours: null,
        originalGrade: 'Grade A',
        deliveryGrade: null,
        photosOriginal: [
          'https://images.unsplash.com/photo-1595278069441-2cf29f8005a4?w=600&auto=format&fit=crop&q=80',
        ],
        photosDelivery: [],
      },
      {
        id: 'TR-3980',
        listingId: 'L-102',
        material: 'Post-Consumer rPET Flakes',
        mass_kg: 24000,
        agreedPrice: 1.32,
        totalValue: 31680,
        currency: '€',
        counterpartOrg: 'EcoPlast Polymers France',
        status: 'delivered',
        stepIndex: 4,
        escrow_state: 'held',
        pickupFacility: 'Antwerp Depot',
        deliveryFacility: 'Lille Circular Terminal',
        shipmentId: 'SH-7712',
        deliveredAt: '2026-09-11T14:30:00Z',
        disputeCountdownHours: 32, // within 48 hours
        originalGrade: 'Grade A+',
        deliveryGrade: 'Grade B (Moisture Detected)',
        gradeDeviationFlag: true,
        photosOriginal: [
          'https://images.unsplash.com/photo-1563245372-f21724e3856d?w=600&auto=format&fit=crop&q=80',
        ],
        photosDelivery: [
          'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
        ],
      },
      {
        id: 'TR-3801',
        listingId: 'L-103',
        material: 'Industrial LDPE Stretch Bales',
        mass_kg: 14000,
        agreedPrice: 0.76,
        totalValue: 10640,
        currency: '€',
        counterpartOrg: 'Duisburg Recycling Hub',
        status: 'closed',
        stepIndex: 5,
        escrow_state: 'released',
        pickupFacility: 'Duisburg Logistics Platform',
        deliveryFacility: 'Dortmund Sorter',
        shipmentId: 'SH-6510',
        deliveredAt: '2026-09-02T10:15:00Z',
        disputeCountdownHours: 0,
        originalGrade: 'Grade B+',
        deliveryGrade: 'Grade B+',
        gradeDeviationFlag: false,
        photosOriginal: [
          'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
        ],
        photosDelivery: [
          'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=600&auto=format&fit=crop&q=80',
        ],
      },
    ])
  );

  useEffect(() => {
    setStorageItem('reloop_trades', trades);
  }, [trades]);

  // Logistics & Vehicles State
  const [vehicles, setVehicles] = useState([
    {
      id: 'V-01',
      name: 'EcoCarrier Electric Mega #12',
      plate: 'NL-88-RTB',
      vehicle_class: 'Class 8 Electric Semi (53ft)',
      capacity_kg: 24000,
      volume_m3: 88,
      dimensions: '13.6m x 2.45m x 2.65m',
      baseLocation: 'Rotterdam Hub',
      status: 'In Transit',
      activeShipmentId: 'SH-8821',
    },
    {
      id: 'V-02',
      name: 'BioDiesel Euro-6 Curtainsider #04',
      plate: 'BE-44-ANT',
      vehicle_class: 'Curtainsider 40-Tonne',
      capacity_kg: 26500,
      volume_m3: 92,
      dimensions: '13.6m x 2.48m x 2.70m',
      baseLocation: 'Antwerp Depot',
      status: 'Available',
      activeShipmentId: null,
    },
  ]);

  const [proposedRoutes, setProposedRoutes] = useState([
    {
      id: 'RT-882',
      title: 'Tri-Facility Benelux Loop',
      origin: 'Rotterdam Hub',
      stops: [
        { type: 'pickup', facility: 'Rotterdam Hub', lot: '18,500kg rHDPE', time: '08:00' },
        { type: 'pickup', facility: 'Breda Circular Yard', lot: '4,200kg rPP', time: '11:30' },
        { type: 'delivery', facility: 'Antwerp Processing', lot: 'Complete Drop', time: '15:00' },
      ],
      distance_km: 174,
      loadFactorPct: 92,
      estRevenue: 1850,
      status: 'pending', // 'pending' | 'accepted' | 'declined'
    },
    {
      id: 'RT-890',
      title: 'Rhein-Ruhr Direct Corridor',
      origin: 'Duisburg Platform',
      stops: [
        { type: 'pickup', facility: 'Duisburg Platform', lot: '14,000kg LDPE', time: '07:00' },
        { type: 'delivery', facility: 'Cologne EcoCompound', lot: '14,000kg Drop', time: '10:30' },
      ],
      distance_km: 92,
      loadFactorPct: 78,
      estRevenue: 980,
      status: 'pending',
    },
  ]);

  const [backhauls, setBackhauls] = useState([
    {
      id: 'BH-01',
      vehicleId: 'V-02',
      origin: 'Antwerp Port',
      destination: 'Rotterdam Hub',
      dateWindow: '2026-09-16 to 2026-09-17',
      availableCapacityKg: 22000,
      availableVolumeM3: 75,
      status: 'Open for Auto-Match',
    },
  ]);

  // Team Members (for Settings)
  const [teamMembers, setTeamMembers] = useState([
    { id: 1, name: 'Elena Rostova', email: 'elena@biopolymerlabs.eu', role: 'Head of Circular Logistics', platform_admin: true, reporting: true },
    { id: 2, name: 'Marcus Vance', email: 'marcus.vance@biopolymerlabs.eu', role: 'Trading Desk Specialist', platform_admin: false, reporting: true },
    { id: 3, name: 'Sanne de Jong', email: 'sanne@biopolymerlabs.eu', role: 'Compliance Auditor', platform_admin: false, reporting: true },
  ]);

  // Emission Factors (for Admin)
  const [emissionFactors, setEmissionFactors] = useState([
    { id: 'EF-01', material: 'rPET Flakes', efVirgin: 2.15, efReprocess: 0.38, source: 'ecoinvent 3.9 / PlasticsEurope', version: 'v2.4', updatedAt: '2026-08-10' },
    { id: 'EF-02', material: 'rHDPE Regrind', efVirgin: 1.95, efReprocess: 0.31, source: 'WRAP UK & PlasticsEurope', version: 'v2.4', updatedAt: '2026-08-10' },
    { id: 'EF-03', material: 'rLDPE Film', efVirgin: 2.08, efReprocess: 0.42, source: 'ecoinvent 3.9', version: 'v2.3', updatedAt: '2026-07-22' },
    { id: 'EF-04', material: 'rPP Dark', efVirgin: 1.98, efReprocess: 0.45, source: 'FEVE & PlasticsEurope', version: 'v2.2', updatedAt: '2026-06-18' },
  ]);

  // Shortlist / Multi-Lot Cart State (persisted)
  const DEFAULT_SHORTLIST = [
    {
      listingId: 'L-101',
      qty_kg: 10000,
      addedAt: '2026-09-12T08:30:00Z',
    },
    {
      listingId: 'L-103',
      qty_kg: 8000,
      addedAt: '2026-09-12T09:15:00Z',
    },
  ];

  const [shortlist, setShortlist] = useState(() =>
    getStorageItem('reloop_shortlist_cart', DEFAULT_SHORTLIST)
  );

  useEffect(() => {
    setStorageItem('reloop_shortlist_cart', shortlist);
  }, [shortlist]);

  // B2B Order Requests & Quotes State (persisted)
  const DEFAULT_ORDER_REQUESTS = [
    {
      id: 'REQ-ORD-901',
      type: 'buy_now', // 'buy_now' | 'quote_request'
      listingId: 'L-101',
      listingTitle: 'Clean Post-Industrial rHDPE Regrind (Grade A)',
      buyerOrg: 'Nordic Packaging NV',
      buyerContact: 'Lukas Van Der Meer (Procurement Director)',
      buyerVerified: true,
      sellerOrg: 'BioPolymer Labs Europe',
      requestedQty_kg: 14000,
      offeredPricePerKg: 1.12,
      totalValue: 15680,
      deliveryFacility: 'Antwerp Port Circular Terminal',
      pickupFacility: 'Rotterdam Circular Hub',
      preferredPickup: '2026-09-22',
      logisticsType: 'platform',
      notes: 'Need batch certificate with ASTM D1238 melt flow indexing before pickup.',
      status: 'pending', // 'pending' | 'accepted' | 'declined' | 'countered' | 'cancelled'
      counterOffer: null,
      createdAt: '2026-09-12T14:20:00Z',
    },
    {
      id: 'REQ-ORD-882',
      type: 'quote_request',
      listingId: 'L-103',
      listingTitle: 'Clean Industrial LDPE Stretch Film Bales',
      buyerOrg: 'BioPolymer Labs Europe',
      buyerContact: 'Marcus Vance',
      buyerVerified: true,
      sellerOrg: 'Rheinland Recovery GmbH',
      requestedQty_kg: 10000,
      offeredPricePerKg: 0.70,
      totalValue: 7000,
      deliveryFacility: 'Rotterdam Circular Hub (HQ)',
      pickupFacility: 'Duisburg Platform',
      preferredPickup: '2026-09-25',
      logisticsType: 'platform',
      notes: 'Looking for a recurring monthly batch if quality aligns with test spec.',
      status: 'countered',
      counterOffer: {
        pricePerKg: 0.74,
        qty_kg: 10000,
        totalValue: 7400,
        newWindow: '2026-09-28 to 2026-10-02',
        message: 'We can accept €0.74/kg for high-transparency 98/2 grade with automated bale loading included.',
        counteredAt: '2026-09-12T16:45:00Z',
      },
      createdAt: '2026-09-12T11:00:00Z',
    },
    {
      id: 'REQ-ORD-740',
      type: 'buy_now',
      listingId: 'L-105',
      listingTitle: 'Baled OCC Corrugated Cardboard (Export Grade)',
      buyerOrg: 'BioPolymer Labs Europe',
      buyerContact: 'Marcus Vance',
      buyerVerified: true,
      sellerOrg: 'BioPolymer Labs Europe',
      requestedQty_kg: 22000,
      offeredPricePerKg: 0.24,
      totalValue: 5280,
      deliveryFacility: 'Rotterdam Circular Hub (HQ)',
      pickupFacility: 'Rotterdam Circular Hub',
      preferredPickup: '2026-09-18',
      logisticsType: 'platform',
      notes: 'Immediate loading via forklift bay 4.',
      status: 'accepted',
      tradeId: 'TR-4091',
      createdAt: '2026-09-11T09:10:00Z',
    },
  ];

  const [orderRequests, setOrderRequests] = useState(() =>
    getStorageItem('reloop_order_requests', DEFAULT_ORDER_REQUESTS)
  );

  useEffect(() => {
    setStorageItem('reloop_order_requests', orderRequests);
  }, [orderRequests]);

  // Shortlist Helper Functions
  const addToShortlist = (listingId, qty_kg = null) => {
    const listing = listings.find((l) => l.id === listingId);
    const defaultQty = qty_kg || (listing ? listing.mass_kg : 1000);
    setShortlist((prev) => {
      const exists = prev.find((item) => item.listingId === listingId);
      const next = exists
        ? prev.map((item) =>
            item.listingId === listingId
              ? { ...item, qty_kg: qty_kg || item.qty_kg }
              : item
          )
        : [...prev, { listingId, qty_kg: defaultQty, addedAt: new Date().toISOString() }];
      setStorageItem('reloop_shortlist_cart', next);
      return next;
    });
    // Add lightweight notification
    setNotifications((prev) => {
      const next = [
        {
          id: 'sn-' + Date.now(),
          type: 'match',
          title: 'Saved to Shortlist',
          desc: `${listing?.title || 'Lot'} has been added to your procurement shortlist.`,
          link: '/shortlist',
          date: 'Just now',
          unread: true,
        },
        ...prev,
      ];
      setStorageItem('reloop_notifications', next);
      return next;
    });
  };

  const removeFromShortlist = (listingId) => {
    setShortlist((prev) => {
      const next = prev.filter((item) => item.listingId !== listingId);
      setStorageItem('reloop_shortlist_cart', next);
      return next;
    });
  };

  const updateShortlistQty = (listingId, qty_kg) => {
    setShortlist((prev) => {
      const next = prev.map((item) =>
        item.listingId === listingId ? { ...item, qty_kg: Number(qty_kg) } : item
      );
      setStorageItem('reloop_shortlist_cart', next);
      return next;
    });
  };

  const clearShortlist = () => {
    setStorageItem('reloop_shortlist_cart', []);
    setShortlist([]);
  };

  const isInShortlist = (listingId) => {
    return shortlist.some((item) => item.listingId === listingId);
  };

  // Data Synchronization with Real Backend
  const refreshBackendData = async () => {
    try {
      setBackendSyncStatus('syncing');

      // 1. Fetch Listings
      try {
        const remoteListings = await listingsService.fetchListings();
        if (remoteListings && remoteListings.length > 0) {
          setListings((prev) => {
            const remoteIds = new Set(remoteListings.map((l) => l.id));
            const localRemaining = prev.filter((p) => !remoteIds.has(p.id));
            return [...remoteListings, ...localRemaining];
          });
        }
      } catch (err) {
        console.warn('Backend listings sync:', err?.message || err);
      }

      // 2. Fetch Requirements
      try {
        const remoteReqs = await requirementsService.fetchRequirements();
        if (remoteReqs && remoteReqs.length > 0) {
          setRequirements((prev) => {
            const remoteIds = new Set(remoteReqs.map((r) => r.id));
            const localRemaining = prev.filter((p) => !remoteIds.has(p.id));
            return [...remoteReqs, ...localRemaining];
          });
        }
      } catch (err) {
        console.warn('Backend requirements sync:', err?.message || err);
      }

      // 3. Fetch Matches
      try {
        const remoteMatches = await matchingService.fetchMatches();
        if (remoteMatches && remoteMatches.length > 0) {
          setMatches((prev) => {
            const remoteIds = new Set(remoteMatches.map((m) => m.id));
            const localRemaining = prev.filter((p) => !remoteIds.has(p.id));
            return [...remoteMatches, ...localRemaining];
          });
        }
      } catch (err) {
        console.warn('Backend matches sync:', err?.message || err);
      }

      // 4. Fetch Orders & Negotiations
      try {
        const [ordersRes, negsRes] = await Promise.allSettled([
          commerceService.fetchOrders(),
          commerceService.fetchNegotiations(),
        ]);

        if (ordersRes.status === 'fulfilled' && ordersRes.value?.length > 0) {
          setTrades((prev) => {
            const remoteIds = new Set(ordersRes.value.map((o) => o.id));
            const localRemaining = prev.filter((t) => !remoteIds.has(t.id));
            return [...ordersRes.value, ...localRemaining];
          });
        }

        if (negsRes.status === 'fulfilled' && negsRes.value?.length > 0) {
          setOrderRequests((prev) => {
            const remoteIds = new Set(negsRes.value.map((n) => n.id));
            const localRemaining = prev.filter((r) => !remoteIds.has(r.id));
            return [...negsRes.value, ...localRemaining];
          });
        }
      } catch (err) {
        console.warn('Backend commerce sync:', err?.message || err);
      }

      // 5. Fetch Notifications
      try {
        const remoteNotifs = await notificationsService.fetchNotifications();
        if (remoteNotifs && remoteNotifs.length > 0) {
          setNotifications(remoteNotifs);
        }
      } catch (err) {
        // Ignored
      }

      // 6. Fetch User/Org info if token exists
      if (getAccessToken()) {
        try {
          const me = await authService.getMe();
          if (me.user) {
            setOrg((prev) => ({
              ...prev,
              name: me.org?.name || me.user.name || prev.name,
              legalName: me.org?.legalName || prev.legalName,
              businessId: me.org?.businessId || prev.businessId,
              email: me.user.email || prev.email,
              verificationStatus: me.org?.verificationStatus || prev.verificationStatus,
              capabilities: me.org?.roles && me.org.roles.length > 0 ? me.org.roles : prev.capabilities,
              permissions: {
                ...prev.permissions,
                platform_admin: ['owner', 'admin'].includes(me.user.role),
              },
            }));
          }
          const facs = await authService.fetchFacilities();
          if (facs && facs.length > 0) {
            setFacilities(facs.map((f, idx) => ({
              id: f._id || idx + 1,
              name: f.name,
              address: f.address?.street ? `${f.address.street}, ${f.address.city}, ${f.address.country}` : 'Rotterdam Circular Hub',
              lat: f.location?.coordinates?.[1] || 51.9054,
              lng: f.location?.coordinates?.[0] || 4.4842,
              isPrimary: idx === 0,
              capacityTons: 4500,
            })));
          }
        } catch (_err) {
          // Token might be expired or not yet valid
        }
      }

      setBackendSyncStatus('connected');
    } catch (err) {
      console.warn('Backend connection unavailable, running with resilient state:', err);
      setBackendSyncStatus('offline');
    }
  };

  useEffect(() => {
    refreshBackendData();
  }, []);

  // Auth Operations
  const login = async (email, password) => {
    try {
      const res = await authService.login(email, password);
      setIsLoggedIn(true);
      await refreshBackendData();
      return { success: true, data: res };
    } catch (err) {
      setIsLoggedIn(true);
      return { success: false, error: err.message };
    }
  };

  const signup = async (formData) => {
    try {
      const res = await authService.register(formData);
      setIsLoggedIn(true);
      await refreshBackendData();
      return { success: true, data: res };
    } catch (err) {
      setIsLoggedIn(true);
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
  };

  // Listings & Requirements Operations
  const addListing = async (newListing) => {
    let created;
    try {
      created = await listingsService.createListing(newListing);
    } catch (err) {
      console.warn('Backend listing creation error, storing locally:', err.message);
      created = {
        ...newListing,
        id: `L-${Date.now().toString().slice(-4)}`,
        status: 'published',
      };
    }
    setListings((prev) => [created, ...prev]);
    const stored = getStorageItem('reloop_custom_listings', []);
    setStorageItem('reloop_custom_listings', [created, ...stored]);
    return created;
  };

  const addRequirement = async (newReq) => {
    let created;
    try {
      created = await requirementsService.createRequirement(newReq);
    } catch (err) {
      console.warn('Backend requirement creation error, storing locally:', err.message);
      created = {
        ...newReq,
        id: `R-${Date.now().toString().slice(-4)}`,
        status: 'Active',
      };
    }
    setRequirements((prev) => {
      const next = [created, ...prev];
      setStorageItem('reloop_requirements', next);
      return next;
    });
    return created;
  };

  // Order Request Helper Functions
  const createOrderRequest = async (orderData) => {
    const newId = `REQ-ORD-${Math.floor(100 + Math.random() * 900)}`;
    const newRequest = {
      id: newId,
      status: 'pending',
      counterOffer: null,
      createdAt: new Date().toISOString(),
      ...orderData,
    };
    setOrderRequests((prev) => [newRequest, ...prev]);

    // Send to backend
    try {
      if (orderData.type === 'negotiate' || orderData.order_type === 'negotiate') {
        await commerceService.submitNegotiation({
          listingId: orderData.listingId,
          proposed_price_per_kg: orderData.offeredPricePerKg || orderData.proposed_price_per_kg,
          quantity_kg: orderData.requestedQty_kg || orderData.quantity_kg,
          deliveryNotes: orderData.notes || orderData.deliveryNotes,
        });
      } else {
        await commerceService.createOrder({
          listingId: orderData.listingId,
          quantity_kg: orderData.requestedQty_kg || orderData.quantity_kg,
          order_type: 'paid_purchase',
          deliveryNotes: orderData.notes || orderData.deliveryNotes,
        });
      }
    } catch (err) {
      console.warn('Backend order placement failed, saved locally:', err.message);
    }

    // Build notification content
    const isBuy = orderData.type === 'buy_now';
    const notifTitle = isBuy ? 'Purchase Order Submitted' : 'Quote Request Sent';
    const qty = (orderData.requestedQty_kg || orderData.quantity_kg || 1000).toLocaleString();
    const notifDesc = `Your ${isBuy ? 'order' : 'quote request'} for ${orderData.listingTitle} (${qty} kg) is pending seller review.`;
    const totalVal = orderData.totalValue
      ? `€${Number(orderData.totalValue).toLocaleString()}`
      : 'N/A';
    const pricePerKg = orderData.offeredPricePerKg
      ? `€${Number(orderData.offeredPricePerKg).toFixed(2)}/kg`
      : 'N/A';

    // Send in-app notification
    setNotifications((prev) => [
      {
        id: 'ord-' + Date.now(),
        type: 'match',
        title: notifTitle,
        desc: notifDesc,
        link: `/orders`,
        date: 'Just now',
        unread: true,
      },
      ...prev,
    ]);

    // ── AUTO-EMAIL to xyz30102111@gmail.com immediately on purchase / quote ──
    const TARGET_EMAIL = 'xyz30102111@gmail.com';
    const emailSubject = `[ReLoop ${isBuy ? 'Purchase' : 'Quote'}] ${newId} — ${orderData.listingTitle}`;
    const emailHtml = `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;padding:28px;color:#111;max-width:600px;border:1px solid #eee;border-radius:16px;">
        <h2 style="color:#7201FF;margin-top:0;font-size:20px;">
          ${isBuy ? '🛒 Purchase Order Confirmed' : '💬 Quote Request Sent'} — ReLoop
        </h2>
        <p style="font-size:14px;color:#444;margin-bottom:20px;">${notifDesc}</p>

        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <tr style="background:#f5f3ff;">
            <td style="padding:10px 12px;font-weight:bold;border-radius:8px 0 0 8px;">Order ID</td>
            <td style="padding:10px 12px;font-family:monospace;border-radius:0 8px 8px 0;">${newId}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;font-weight:bold;">Listing</td>
            <td style="padding:10px 12px;">${orderData.listingTitle || 'N/A'}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:10px 12px;font-weight:bold;">Quantity</td>
            <td style="padding:10px 12px;">${qty} kg</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;font-weight:bold;">Price per kg</td>
            <td style="padding:10px 12px;">${pricePerKg}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:10px 12px;font-weight:bold;">Total Value</td>
            <td style="padding:10px 12px;font-weight:bold;color:#7201FF;">${totalVal}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;font-weight:bold;">Seller</td>
            <td style="padding:10px 12px;">${orderData.sellerOrg || 'N/A'}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:10px 12px;font-weight:bold;">Delivery To</td>
            <td style="padding:10px 12px;">${orderData.deliveryFacility || 'N/A'}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;font-weight:bold;">Pickup From</td>
            <td style="padding:10px 12px;">${orderData.pickupFacility || 'N/A'}</td>
          </tr>
          <tr style="background:#f9f9f9;">
            <td style="padding:10px 12px;font-weight:bold;">Logistics</td>
            <td style="padding:10px 12px;">${orderData.logisticsType || 'platform'}</td>
          </tr>
          <tr>
            <td style="padding:10px 12px;font-weight:bold;">Notes</td>
            <td style="padding:10px 12px;color:#555;">${orderData.notes || '—'}</td>
          </tr>
          <tr style="background:#f0fff4;">
            <td style="padding:10px 12px;font-weight:bold;color:#15803d;">Status</td>
            <td style="padding:10px 12px;color:#15803d;font-weight:bold;">Pending Seller Review</td>
          </tr>
        </table>

        <p style="margin-top:24px;">
          <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/orders"
             style="display:inline-block;background:#7201FF;color:white;padding:11px 22px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:13px;">
            View Order in ReLoop →
          </a>
        </p>

        <hr style="margin-top:28px;border:none;border-top:1px solid #eee;" />
        <p style="font-size:11px;color:#999;margin:0;">Auto-dispatched to ${TARGET_EMAIL} • ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST</p>
      </div>
    `;

    // 1. Fire backend email (no await — non-blocking so checkout never hangs)
    notificationsService.sendEmailNotification({
      to: TARGET_EMAIL,
      title: notifTitle,
      desc: notifDesc,
      link: `${typeof window !== 'undefined' ? window.location.origin : ''}/orders`,
      date: 'Just now',
    }).catch((e) => console.warn('Auto-email dispatch failed silently:', e));

    // 2. Also open mailto: as a fallback so mail is sent even without a live backend
    try {
      const mailBody =
        `Order ID: ${newId}\nListing: ${orderData.listingTitle}\nQty: ${qty} kg\n` +
        `Price/kg: ${pricePerKg}\nTotal: ${totalVal}\nSeller: ${orderData.sellerOrg || 'N/A'}\n` +
        `Delivery To: ${orderData.deliveryFacility || 'N/A'}\nStatus: Pending Seller Review\n` +
        `\nView: ${typeof window !== 'undefined' ? window.location.origin : ''}/orders`;

      const mailtoHref = `mailto:${TARGET_EMAIL}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(mailBody)}`;
      const anchor = document.createElement('a');
      anchor.href = mailtoHref;
      anchor.target = '_blank';
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch (_e) {
      // silently ignore if DOM not ready
    }

    return newRequest;
  };

  const acceptOrderRequest = async (orderId) => {
    const req = orderRequests.find((r) => r.id === orderId);
    if (!req) return;

    // Call backend if negotiation
    if (req._id || orderId.startsWith('NEG-')) {
      try {
        await commerceService.acceptNegotiation(req._id || orderId);
      } catch (_err) {}
    }

    // Create corresponding escrow trade
    const newTradeId = `TR-${Math.floor(5000 + Math.random() * 900)}`;
    const newTrade = {
      id: newTradeId,
      listingId: req.listingId,
      sourceOrderRequestId: req.id,
      material: req.listingTitle,
      mass_kg: req.counterOffer ? req.counterOffer.qty_kg : req.requestedQty_kg,
      agreedPrice: req.counterOffer ? req.counterOffer.pricePerKg : req.offeredPricePerKg,
      totalValue: req.counterOffer ? req.counterOffer.totalValue : req.totalValue,
      currency: '€',
      counterpartOrg: req.buyerOrg === org.name ? req.sellerOrg : req.buyerOrg,
      status: 'claimed',
      stepIndex: 1,
      escrow_state: 'held',
      pickupFacility: req.pickupFacility || 'Rotterdam Circular Hub',
      deliveryFacility: req.deliveryFacility || 'Antwerp Depot',
      shipmentId: `SH-${Math.floor(8000 + Math.random() * 900)}`,
      deliveredAt: null,
      dispute_opened: false,
      diverted_co2e_kg: Math.round((req.requestedQty_kg || 1000) * 1.34),
      createdAt: new Date().toISOString(),
    };

    setTrades((prev) => [newTrade, ...prev]);

    // Update the request status
    setOrderRequests((prev) =>
      prev.map((r) => (r.id === orderId ? { ...r, status: 'accepted', tradeId: newTradeId } : r))
    );

    // Send notification
    setNotifications((prev) => [
      {
        id: 'acc-' + Date.now(),
        type: 'match',
        title: 'Order Confirmed & Escrow Initiated',
        desc: `Order ${orderId} has been accepted. Trade ${newTradeId} is now active in escrow.`,
        link: `/trades/${newTradeId}`,
        date: 'Just now',
        unread: true,
      },
      ...prev,
    ]);

    return newTrade;
  };

  const declineOrderRequest = (orderId, reason = 'Not available at current specifications') => {
    setOrderRequests((prev) =>
      prev.map((r) => (r.id === orderId ? { ...r, status: 'declined', declineReason: reason } : r))
    );

    setNotifications((prev) => [
      {
        id: 'dec-' + Date.now(),
        type: 'match',
        title: 'Order Request Declined',
        desc: `Order request ${orderId} was declined by the seller: "${reason}".`,
        link: `/seller/inbox`,
        date: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
  };

  const counterOrderRequest = async (orderId, counterData) => {
    const req = orderRequests.find((r) => r.id === orderId);
    if (req?._id || orderId.startsWith('NEG-')) {
      try {
        await commerceService.counterNegotiation(req?._id || orderId, counterData);
      } catch (_err) {}
    }

    setOrderRequests((prev) =>
      prev.map((r) =>
        r.id === orderId
          ? {
              ...r,
              status: 'countered',
              counterOffer: {
                ...counterData,
                counteredAt: new Date().toISOString(),
              },
            }
          : r
      )
    );

    setNotifications((prev) => [
      {
        id: 'cnt-' + Date.now(),
        type: 'match',
        title: 'Counter-Offer Sent',
        desc: `Counter-offer of €${counterData.pricePerKg || counterData.counter_price_per_kg}/kg submitted for Order ${orderId}.`,
        link: `/seller/inbox`,
        date: 'Just now',
        unread: true,
      },
      ...prev,
    ]);
  };

  const acceptCounterOffer = (orderId) => {
    return acceptOrderRequest(orderId);
  };

  // Quick State Helper Functions
  const toggleCapability = (cap) => {
    setOrg((prev) => {
      const exists = prev.capabilities.includes(cap);
      const updated = exists
        ? prev.capabilities.filter((c) => c !== cap)
        : [...prev.capabilities, cap];
      const finalRoles = updated.length ? updated : [cap];
      authService.updateOrganization({ roles: finalRoles }).catch(() => {});
      return { ...prev, capabilities: finalRoles };
    });
  };

  const togglePermission = (perm) => {
    setOrg((prev) => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [perm]: !prev.permissions[perm],
      },
    }));
  };

  const setVerificationStatus = (status) => {
    setOrg((prev) => ({ ...prev, verificationStatus: status }));
  };

  const resetDemoData = () => {
    localStorage.removeItem('reloop_shortlist_cart');
    localStorage.removeItem('reloop_order_requests');
    localStorage.removeItem('reloop_trades');
    localStorage.removeItem('reloop_notifications');
    localStorage.removeItem('reloop_custom_listings');
    localStorage.removeItem('reloop_requirements');
    localStorage.removeItem('reloop_org_profile');
    localStorage.removeItem('reloop_auth_state');
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        org,
        setOrg,
        facilities,
        setFacilities,
        notifications,
        setNotifications,
        listings,
        setListings,
        requirements,
        setRequirements,
        matches,
        setMatches,
        trades,
        setTrades,
        vehicles,
        setVehicles,
        proposedRoutes,
        setProposedRoutes,
        backhauls,
        setBackhauls,
        teamMembers,
        setTeamMembers,
        emissionFactors,
        setEmissionFactors,
        toggleCapability,
        togglePermission,
        setVerificationStatus,
        isLoggedIn,
        setIsLoggedIn,
        login,
        signup,
        logout,
        refreshBackendData,
        backendSyncStatus,
        addListing,
        addRequirement,
        // E-Commerce Shortlist & Orders
        shortlist,
        setShortlist,
        addToShortlist,
        removeFromShortlist,
        updateShortlistQty,
        clearShortlist,
        isInShortlist,
        orderRequests,
        setOrderRequests,
        createOrderRequest,
        acceptOrderRequest,
        declineOrderRequest,
        counterOrderRequest,
        acceptCounterOffer,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
