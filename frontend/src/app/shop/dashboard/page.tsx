'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import {
  MapPin,
  Loader2,
  Send,
  MessageSquare,
  Compass,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  ArrowRight,
  TrendingUp,
  Store,
  Layers,
  Sparkles
} from 'lucide-react';

interface Farmer {
  id: string;
  name: string;
  store_name?: string;
  location?: string;
  email: string;
  latitude: number;
  longitude: number;
  distance: number;
  avatar_url?: string;
}

interface Inquiry {
  id: string;
  shop_id: string;
  farmer_id: string;
  product_id?: string;
  quantity: number;
  unit: string;
  message?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  created_at: string;
  farmers?: {
    name: string;
    store_name?: string;
    location?: string;
    email: string;
  };
}

const INQUIRY_STATUS_CONFIG = {
  pending: { label: 'Pending Response', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
  accepted: { label: 'Inquiry Accepted', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
  rejected: { label: 'Inquiry Declined', icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' },
  completed: { label: 'Fulfilled', icon: Truck, color: 'text-purple-600', bg: 'bg-purple-50' }
};

export default function ShopDashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'farmers' | 'inquiries'>('farmers');
  const [radius, setRadius] = useState<number>(50); // Default 50km
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [farmersLoading, setFarmersLoading] = useState(true);
  const [inquiriesLoading, setInquiriesLoading] = useState(true);
  const [shopCoordinates, setShopCoordinates] = useState<{ latitude: number; longitude: number } | null>(null);

  // Inquiry Form Modal State
  const [selectedFarmer, setSelectedFarmer] = useState<Farmer | null>(null);
  const [cropName, setCropName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('kg');
  const [message, setMessage] = useState('');
  const [sendingInquiry, setSendingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);
  const [formError, setFormError] = useState('');

  // Coordinates Update State
  const [updatingCoords, setUpdatingCoords] = useState(false);
  const [coordsSuccess, setCoordsSuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && user?.role !== 'SHOP') {
      router.push('/');
    }
  }, [isLoading, isAuthenticated, user, router]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'SHOP') {
      fetchNearbyFarmers();
      fetchInquiries();
    }
  }, [isAuthenticated, user, radius]);

  const fetchNearbyFarmers = async () => {
    setFarmersLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/b2b/farmers?radius=${radius}`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setFarmers(data.farmers || []);
        setShopCoordinates(data.shopCoordinates || null);
      }
    } catch (e) {
      console.error('Failed to fetch nearby farmers', e);
    } finally {
      setFarmersLoading(false);
    }
  };

  const fetchInquiries = async () => {
    setInquiriesLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/b2b/inquiries/shop`, {
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok) {
        setInquiries(data.inquiries || []);
      }
    } catch (e) {
      console.error('Failed to fetch inquiries', e);
    } finally {
      setInquiriesLoading(false);
    }
  };

  const handleUpdateCoordinates = async () => {
    setUpdatingCoords(true);
    setCoordsSuccess(false);
    try {
      // Simulate/Assign clean random local coordinates for Mumbai/Pune/Nashik farm hubs
      const sampleCoords = [
        { lat: 19.0760, lng: 72.8777, name: 'Mumbai Central Hub' },
        { lat: 18.5204, lng: 73.8567, name: 'Pune B2B Center' },
        { lat: 19.9975, lng: 73.7898, name: 'Nashik Farm Center' }
      ];
      const randomCoord = sampleCoords[Math.floor(Math.random() * sampleCoords.length)];

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          latitude: randomCoord.lat,
          longitude: randomCoord.lng,
          location: randomCoord.name
        })
      });

      if (res.ok) {
        setCoordsSuccess(true);
        setTimeout(() => setCoordsSuccess(false), 3000);
        fetchNearbyFarmers();
      }
    } catch (e) {
      console.error('Failed to update coordinates', e);
    } finally {
      setUpdatingCoords(false);
    }
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!quantity || isNaN(Number(quantity))) {
      setFormError('Please enter a valid quantity.');
      return;
    }
    if (!selectedFarmer) return;

    setSendingInquiry(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/b2b/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          farmer_id: selectedFarmer.id,
          quantity: parseInt(quantity),
          unit,
          message: `${cropName ? `Crop Interested: ${cropName}. ` : ''}${message}`
        })
      });

      const data = await res.json();
      if (res.ok) {
        setInquirySuccess(true);
        setCropName('');
        setQuantity('');
        setMessage('');
        fetchInquiries();
        setTimeout(() => {
          setInquirySuccess(false);
          setSelectedFarmer(null);
        }, 2000);
      } else {
        setFormError(data.error || 'Failed to submit inquiry.');
      }
    } catch (e) {
      setFormError('Connection error. Please try again.');
    } finally {
      setSendingInquiry(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh]">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'SHOP') return null;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto w-full pt-20 md:pt-8">
      {/* Header Panel */}
      <div className="bg-card rounded-3xl p-6 md:p-8 shadow-sm border border-border mb-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center text-primary shrink-0">
            <Store size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{user.store_name || user.name || 'Shop Dashboard'}</h1>
            <p className="text-muted text-sm flex items-center gap-1.5 justify-center md:justify-start">
              <MapPin size={14} className="text-gray-400" />
              {user.location || 'Location Coordinates Not Assigned'}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <button
            onClick={handleUpdateCoordinates}
            disabled={updatingCoords}
            className={`px-4 py-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 border ${
              coordsSuccess
                ? 'bg-green-500 text-white border-green-500 shadow-md shadow-green-100'
                : 'bg-card text-foreground border-border hover:bg-background'
            }`}
          >
            {updatingCoords ? (
              <Loader2 size={14} className="animate-spin" />
            ) : coordsSuccess ? (
              'Coordinates Synced! ✓'
            ) : (
              'Simulate Coordinates Pin'
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-border p-1 rounded-2xl mb-6">
        <button
          onClick={() => setActiveTab('farmers')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'farmers' ? 'bg-card text-foreground shadow-sm' : 'text-muted'
          }`}
        >
          <Compass size={16} /> Nearby Farmers
        </button>
        <button
          onClick={() => setActiveTab('inquiries')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'inquiries' ? 'bg-card text-foreground shadow-sm' : 'text-muted'
          }`}
        >
          <MessageSquare size={16} /> Bulk Crop Inquiries {inquiries.length > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {inquiries.length}
            </span>
          )}
        </button>
      </div>

      {/* Nearby Farmers Tab */}
      {activeTab === 'farmers' && (
        <div>
          {/* Radius selector panel */}
          <div className="bg-card rounded-3xl p-6 border border-border shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-foreground mb-1 flex items-center gap-2">
                <Sparkles size={16} className="text-yellow-500" /> B2B Connection Circle
              </h3>
              <p className="text-xs text-muted">Query and connect with local farmers within your bulk transport range.</p>
            </div>
            <div className="flex items-center gap-2 bg-border p-1 rounded-xl w-full md:w-auto">
              {[10, 25, 50, 100].map(r => (
                <button
                  key={r}
                  onClick={() => setRadius(r)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    radius === r
                      ? 'bg-primary text-white shadow-sm'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {farmersLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : farmers.length === 0 ? (
            <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-sm">
              <Compass size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-bold text-foreground mb-1">No Farmers Found</h3>
              <p className="text-sm text-muted max-w-sm mx-auto mb-4">
                No registered farmers found within a {radius}km radius. Try increasing the connection circle radius or assign your coordinates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {farmers.map(farmer => (
                <div key={farmer.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary-light text-primary rounded-xl flex items-center justify-center font-bold">
                          {farmer.store_name ? farmer.store_name.charAt(0) : farmer.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground truncate max-w-[200px]">{farmer.store_name || farmer.name}</h4>
                          <p className="text-xs text-muted truncate max-w-[200px]">Farmer: {farmer.name}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold bg-primary-light text-primary px-2.5 py-1 rounded-full whitespace-nowrap">
                        {farmer.distance} km away
                      </span>
                    </div>

                    <p className="text-xs text-muted mb-2 truncate flex items-center gap-1">
                      <MapPin size={12} className="text-gray-400" /> {farmer.location || 'Rural Farm Hub'}
                    </p>
                    <p className="text-xs text-gray-400 truncate mb-4">{farmer.email}</p>
                  </div>

                  <button
                    onClick={() => setSelectedFarmer(farmer)}
                    className="w-full bg-primary-light text-primary font-bold py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all text-xs flex items-center justify-center gap-2 group"
                  >
                    Send Bulk Inquiry
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bulk Crop Inquiries Tab */}
      {activeTab === 'inquiries' && (
        <div className="space-y-4">
          {inquiriesLoading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 size={32} className="animate-spin text-primary" />
            </div>
          ) : inquiries.length === 0 ? (
            <div className="bg-card rounded-3xl p-12 text-center border border-border shadow-sm">
              <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="font-bold text-foreground mb-1">No Inquiries Found</h3>
              <p className="text-sm text-muted max-w-sm mx-auto">
                Any inquiries you send to nearby farmers for bulk supply will appear here. Select a farmer to begin.
              </p>
            </div>
          ) : (
            inquiries.map(inquiry => {
              const status = INQUIRY_STATUS_CONFIG[inquiry.status] || INQUIRY_STATUS_CONFIG.pending;
              const StatusIcon = status.icon;
              return (
                <div key={inquiry.id} className="bg-card rounded-2xl p-5 border border-border shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">INQUIRY #{inquiry.id.slice(0, 8).toUpperCase()}</p>
                      <h4 className="font-bold text-foreground">
                        {inquiry.farmers?.store_name || inquiry.farmers?.name}
                      </h4>
                      <p className="text-xs text-muted">{inquiry.farmers?.location}</p>
                    </div>
                    <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded-full ${status.bg} ${status.color}`}>
                      <StatusIcon size={12} />
                      {status.label}
                    </span>
                  </div>

                  <div className="bg-background rounded-xl p-4 mb-3">
                    <div className="flex justify-between items-center mb-2 border-b border-border/50 pb-2">
                      <span className="text-xs font-semibold text-muted">Requested Qty:</span>
                      <span className="text-sm font-bold text-foreground">{inquiry.quantity} {inquiry.unit}</span>
                    </div>
                    {inquiry.message && (
                      <div>
                        <p className="text-xs font-semibold text-gray-400 mb-1">Message:</p>
                        <p className="text-xs text-muted leading-relaxed italic">{inquiry.message}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>Sent: {new Date(inquiry.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>Direct: {inquiry.farmers?.email}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Inquiry Form Modal */}
      {selectedFarmer && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-3xl w-full max-w-md p-6 shadow-xl border border-border animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-foreground">B2B Bulk Crop Inquiry</h3>
                <p className="text-xs text-muted">To: {selectedFarmer.store_name || selectedFarmer.name}</p>
              </div>
              <button
                onClick={() => setSelectedFarmer(null)}
                className="w-8 h-8 rounded-full bg-border flex items-center justify-center text-muted hover:bg-gray-200 font-bold"
              >
                ✕
              </button>
            </div>

            {inquirySuccess ? (
              <div className="py-8 text-center">
                <div className="w-16 h-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} />
                </div>
                <h4 className="font-bold text-foreground mb-1">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-muted">The farmer has been notified and will respond shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendInquiry} className="space-y-4">
                {formError && (
                  <p className="text-xs font-semibold text-red-500 bg-red-50 p-2.5 rounded-lg text-center border border-red-100">
                    {formError}
                  </p>
                )}

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Crop Name</label>
                  <input
                    type="text"
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    placeholder="e.g. Alphonso Mangoes, basmati, etc."
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Quantity</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder="e.g. 500"
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-foreground mb-1.5">Unit</label>
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="quintal">Quintals (100 kg)</option>
                      <option value="ton">Tons (1000 kg)</option>
                      <option value="piece">Pieces</option>
                      <option value="dozen">Dozens</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Additional Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Include details about delivery schedule, price proposals, or packing requirements."
                    rows={3}
                    className="w-full bg-background border border-border rounded-xl py-2.5 px-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sendingInquiry}
                  className="w-full bg-primary text-white font-bold py-3 rounded-xl shadow-md hover:bg-primary/95 transition-all text-xs flex justify-center items-center gap-2 disabled:opacity-50"
                >
                  {sendingInquiry ? (
                    <>
                      <Loader2 size={14} className="animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Send B2B Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
