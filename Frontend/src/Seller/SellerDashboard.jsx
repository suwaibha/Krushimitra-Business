import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const aiInsights = [
  { icon: "📈", label: "Recommended price", value: "₹2,840/qtl", valueColor: "#16a34a" },
  { icon: "🕐", label: "Best selling window", value: "Next 12 days", valueColor: "#111827" },
  { icon: "📊", label: "Demand forecast", value: "High • Wheat", valueColor: "#16a34a" },
  { icon: "📍", label: "Nearby buyers", value: "23 active", valueColor: "#16a34a" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const LeafLogo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(145deg, #3a7d55, #2d6a4f)" }}>
      <svg viewBox="0 0 32 32" fill="none" className="w-5 h-5">
        <path d="M22 6C16 6 9 10 9 18c0 2.5.8 4.6 2 6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M9 18C9 12 14 7 22 6c0 8-4 14-11 16" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M11 24c-1.5-1.5-2-3.5-2-6" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M11 24C9 26 8 27 7 28" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
      </svg>
    </div>
  </div>
);

const StatCard = ({ icon, label, value, badge, delay }) => (
  <div className="bg-white rounded-2xl p-5 flex flex-col gap-3 shadow-sm border border-gray-100"
    style={{ animation: `fadeUp 0.4s ease both`, animationDelay: delay }}>
    <div className="flex items-center justify-between">
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg" style={{ background: "#f0fdf4" }}>{icon}</div>
      <span className="text-xs font-semibold" style={{ color: "#16a34a" }}>{badge}</span>
    </div>
    <div>
      <div className="text-2xl font-bold text-gray-900" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{value}</div>
      <div className="text-sm text-gray-400 mt-0.5">{label}</div>
    </div>
  </div>
);

const OfferRow = ({ offer, onAccept, onDecline }) => {
  const { t } = useTranslation();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    await onAccept(offer._id);
    setAccepted(true);
  };

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">
      <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
        style={{ background: offer.color, color: offer.textColor }}>
        {offer.initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 text-sm">{offer.buyerName || offer.name}</div>
        <div className="text-xs text-gray-400">{offer.detail}</div>
      </div>
      <div className="font-bold text-sm flex-shrink-0" style={{ color: "#16a34a" }}>{offer.priceOffered || offer.price}</div>
      <div className="flex gap-2 flex-shrink-0">
        {accepted ? (
          offer.paymentStatus === 'paid' ? (
            <span className="px-4 py-1.5 rounded-lg text-sm font-semibold"
              style={{ background: "#dcfce7", color: "#16a34a", border: "1.5px solid #bbf7d0" }}>
              ✅ Paid
            </span>
          ) : (
            <span className="px-4 py-1.5 rounded-lg text-sm font-semibold"
              style={{ background: "#fef3c7", color: "#92400e", border: "1.5px solid #fde68a" }}>
              💰 Unpaid
            </span>
          )
        ) : (
          <>
            <button onClick={() => onDecline(offer._id)}
              className="px-3 py-1.5 rounded-lg border text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              style={{ borderColor: "#e5e7eb" }}>
              {t('decline')}
            </button>
            <button onClick={handleAccept}
              className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}>
              {t('accept')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ─── CropOffersModal ──────────────────────────────────────────────────────────
const CropOffersModal = ({ crop, onClose }) => {
  const { t } = useTranslation();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const token = localStorage.getItem("sellerToken");
        const res = await fetch(`http://localhost:5000/api/seller/dashboard/crop/${crop._id}/offers`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setOffers(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [crop._id]);

  const timeAgo = (dateStr) => {
    const diff = Math.floor((Date.now() - new Date(dateStr)) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40" style={{ backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg" style={{ animation: "fadeUp 0.3s ease both" }}>
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Offers for {crop.name}</h2>
            <p className="text-sm text-gray-400 mt-0.5">{offers.length} offer{offers.length !== 1 ? 's' : ''} received</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-8 h-8 border-4 border-gray-200 rounded-full animate-spin" style={{ borderTopColor: '#2d6a4f' }}></div>
            </div>
          ) : offers.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <div className="text-4xl mb-3">📭</div>
              <div className="font-medium">No offers yet for this crop</div>
              <div className="text-sm mt-1">Buyers will appear here once they send an offer</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {offers.map(offer => (
                <div key={offer._id} className="flex items-center gap-4 py-4">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: offer.color, color: offer.textColor }}>
                    {offer.initials}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{offer.buyerName}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{offer.detail}</div>
                    <div className="text-xs mt-1" style={{ color: offer.status === 'pending' ? '#d97706' : offer.status === 'accepted' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                      {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)} • {timeAgo(offer.createdAt)}
                    </div>
                  </div>
                  {/* Price + Payment badge */}
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs text-gray-400">Offered</div>
                    <div className="font-bold text-sm" style={{ color: '#2d6a4f' }}>{offer.priceOffered}</div>
                    {offer.status === 'accepted' && (
                      <span className="inline-block mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                        style={offer.paymentStatus === 'paid'
                          ? { background: '#dcfce7', color: '#16a34a' }
                          : { background: '#fef3c7', color: '#92400e' }}>
                        {offer.paymentStatus === 'paid' ? '✅ Paid' : '💰 Unpaid'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

const CropCard = ({ crop, onEdit, onViewOffers, isPaid }) => {
  const { t } = useTranslation();
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border flex flex-col"
      style={{ borderColor: isPaid ? '#86efac' : '#f3f4f6' }}>
      {/* Payment Received Banner */}
      {isPaid && (
        <div className="flex items-center justify-center gap-2 py-2 text-xs font-bold"
          style={{ background: 'linear-gradient(90deg, #16a34a, #22c55e)', color: '#fff' }}>
          <span>✅</span> Payment Received
        </div>
      )}
      <div className="relative h-48 overflow-hidden">
        <img src={crop.img} alt={crop.name} className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold"
          style={{ background: crop.gradeBg, color: crop.gradeColor, backdropFilter: "blur(4px)" }}>
          {crop.grade}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <span className="font-bold text-gray-900 text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{crop.name}</span>
          <span className="flex items-center gap-1 text-sm font-medium text-amber-500">⭐ {crop.rating}</span>
        </div>
        <div className="text-xs text-gray-400 mb-1">by {crop.seller}</div>
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
          <span>📍</span> {crop.location}
        </div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="text-xs text-gray-400">{t('price')}</div>
            <div className="font-bold text-gray-900">{crop.price}<span className="text-xs font-normal text-gray-400">{crop.unit}</span></div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">{t('available')}</div>
            <div className="font-semibold text-gray-700 text-sm">{crop.available}</div>
          </div>
        </div>
        <div className="flex gap-2 mt-auto">
          <button onClick={() => onEdit(crop)} className="flex-1 py-2 rounded-xl border text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            style={{ borderColor: "#e5e7eb" }}>{t('edit')}</button>
          <button onClick={() => onViewOffers(crop)} className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}>{t('viewOffers')}</button>
        </div>
      </div>
    </div>
  );
};

// ─── EditCropModal ────────────────────────────────────────────────────────────
const EditCropModal = ({ crop, onClose, onSubmit }) => {
  // Parse existing values from stored strings e.g. "₹2800" → "2800", "/quintal" → "quintal", "50 quintal" → qty=50 unit=quintal
  const parsePrice = (p) => p ? p.replace(/[^0-9.]/g, '') : '';
  const parseUnit = (u) => u ? u.replace('/', '') : 'quintal';
  const parseQty = (a) => { const m = a ? a.match(/^(\d+)/) : null; return m ? m[1] : ''; };
  const parseUnitFromAvail = (a) => { const m = a ? a.match(/^\d+\s*(\S+)/) : null; return m ? m[1] : 'quintal'; };
  const parseState = (loc) => { const p = loc ? loc.split(',') : []; return p.length >= 2 ? p[p.length - 1].trim() : ''; };
  const parseDistrict = (loc) => { const p = loc ? loc.split(',') : []; return p.length >= 1 ? p[0].trim() : ''; };

  const [formData, setFormData] = useState({
    name: crop?.name || '',
    grade: crop?.grade || 'Grade A',
    quantity: parseQty(crop?.available),
    unit: parseUnitFromAvail(crop?.available),
    expectedPrice: parsePrice(crop?.price),
    state: parseState(crop?.location),
    district: parseDistrict(crop?.location),
    notes: crop?.notes || '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(crop?.img || null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  if (!crop) return null;

  const handleLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported'); return; }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();
        const addr = data.address;
        setFormData(prev => ({ ...prev, state: addr.state || '', district: addr.state_district || addr.county || addr.city || '' }));
      } catch { alert('Could not fetch location.'); }
      finally { setLocationLoading(false); }
    }, () => { alert('Location permission denied.'); setLocationLoading(false); });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setFormData({ ...formData, image: reader.result }); setImagePreview(reader.result); };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(crop._id, formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ animation: 'fadeUp 0.3s ease both' }}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Crop Listing</h2>
            <p className="text-sm text-gray-500">Update the details for <span className="font-semibold">{crop.name}</span>.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Crop Name</label>
              <input type="text" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Quality Grade</label>
              <select value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600 bg-white">
                <option value="Grade Premium">Grade Premium</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <input type="number" required value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Unit</label>
              <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600 bg-white">
                <option value="quintal">quintal</option>
                <option value="kg">kg</option>
                <option value="tons">tons</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Expected Price (₹)</label>
              <input type="number" required value={formData.expectedPrice} onChange={e => setFormData({ ...formData, expectedPrice: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
            <div className="sm:col-span-2 flex items-center justify-between mt-2 mb-[-10px]">
              <h3 className="text-sm font-bold text-gray-900">Location</h3>
              <button type="button" onClick={handleLocation} disabled={locationLoading} className="text-sm font-semibold flex items-center gap-1.5 hover:underline disabled:opacity-50" style={{ color: '#1a5c38' }}>
                📍 {locationLoading ? 'Fetching...' : 'Use Current Location'}
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">State</label>
              <input type="text" required value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">District / County</label>
              <input type="text" required value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea rows="3" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600 resize-none" />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Crop Image</label>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors relative overflow-hidden" style={{ minHeight: 120 }}>
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              ) : (
                <>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                  <span className="text-sm">Click to replace image</span>
                </>
              )}
            </label>
          </div>
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-70" style={{ background: '#1a5c38' }}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── EditProfileModal ──────────────────────────────────────────────────────
const EditProfileModal = ({ currentName, isOpen, onClose, onSubmit }) => {
  const [name, setName] = useState(currentName || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { setError('Name cannot be empty'); return; }
    setLoading(true);
    setError('');
    await onSubmit(name.trim());
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40" style={{ backdropFilter: 'blur(4px)' }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm" style={{ animation: 'fadeUp 0.3s ease both' }}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
            <p className="text-sm text-gray-500">Update your display name</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text" required autoFocus
              value={name} onChange={e => { setName(e.target.value); setError(''); }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600 text-gray-900"
              placeholder="Enter your full name"
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white disabled:opacity-70" style={{ background: '#1a5c38' }}>
              {loading ? 'Saving...' : 'Save Name'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const displayVal = val >= 1000 ? `₹${(val / 1000).toFixed(1).replace('.0', '')}k` : `₹${val}`;
    return (
      <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-100">
        <div className="text-xs text-gray-400 mb-1">{label}</div>
        <div className="font-bold text-gray-900">{displayVal}</div>
      </div>
    );
  }
  return null;
};

const AddCropModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    grade: "Grade Premium",
    quantity: "",
    unit: "quintal",
    expectedPrice: "",
    harvestDate: "",
    state: "",
    district: "",
    notes: "",
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  if (!isOpen) return null;

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(async (position) => {
      try {
        const { latitude, longitude } = position.coords;
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const data = await res.json();

        const address = data.address;
        const state = address.state || "";
        const district = address.state_district || address.county || address.city || "";

        setFormData(prev => ({ ...prev, state, district }));
      } catch (err) {
        console.error("Error fetching location", err);
        alert("Could not fetch location details.");
      } finally {
        setLocationLoading(false);
      }
    }, (error) => {
      console.error(error);
      alert("Failed to get location. Please ensure location permissions are granted.");
      setLocationLoading(false);
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(formData);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-40" style={{ backdropFilter: "blur(4px)" }}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" style={{ animation: "fadeUp 0.3s ease both" }}>
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Add New Crop Listing</h2>
            <p className="text-sm text-gray-500">Fill in the details. Buyers can see your listing immediately.</p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Crop Name</label>
              <input type="text" required placeholder="e.g. Rice, Wheat" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Quality Grade</label>
              <select value={formData.grade} onChange={e => setFormData({ ...formData, grade: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600 bg-white">
                <option value="Grade Premium">Grade Premium</option>
                <option value="Grade A">Grade A</option>
                <option value="Grade B">Grade B</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Quantity</label>
              <input type="number" required placeholder="e.g. 50" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Unit</label>
              <select value={formData.unit} onChange={e => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600 bg-white">
                <option value="quintal">quintal</option>
                <option value="kg">kg</option>
                <option value="tons">tons</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Expected Price (₹)</label>
              <input type="number" required placeholder="e.g. 2800" value={formData.expectedPrice} onChange={e => setFormData({ ...formData, expectedPrice: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Harvest Date</label>
              <input type="date" required value={formData.harvestDate} onChange={e => setFormData({ ...formData, harvestDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>

            <div className="sm:col-span-2 flex items-center justify-between mt-2 mb-[-10px]">
              <h3 className="text-sm font-bold text-gray-900">Location</h3>
              <button type="button" onClick={handleLocation} disabled={locationLoading} className="text-sm font-semibold flex items-center gap-1.5 hover:underline disabled:opacity-50" style={{ color: "#1a5c38" }}>
                📍 {locationLoading ? "Fetching..." : "Use Current Location"}
              </button>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">State</label>
              <input type="text" required placeholder="e.g. Haryana" value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">District / County</label>
              <input type="text" required placeholder="e.g. Karnal" value={formData.district} onChange={e => setFormData({ ...formData, district: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600" />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea placeholder="Any additional info about the crop..." rows="3" value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-green-600 resize-none"></textarea>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-gray-700">Crop Image</label>
            <label className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-gray-400 bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors relative overflow-hidden">
              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              {imagePreview ? (
                <img src={imagePreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-80" />
              ) : (
                <>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mb-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" /></svg>
                  <span className="text-sm font-medium text-gray-600">Click to upload image</span>
                  <span className="text-xs mt-1">PNG, JPG up to 5MB</span>
                </>
              )}
            </label>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-70" style={{ background: "#1a5c38" }}>
              {loading ? "Publishing..." : "Publish Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function SellerDashboard() {
  const { t, i18n } = useTranslation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [viewingCropOffers, setViewingCropOffers] = useState(null);
  const [paidCropIds, setPaidCropIds] = useState([]);

  // We still maintain local state for offers so the user can quickly remove them from UI
  const [offerList, setOfferList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("sellerToken");
        if (!token) {
          window.location.href = "/auth";
          return;
        }

        const response = await fetch("http://localhost:5000/api/seller/dashboard", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          setData(result);
          setOfferList(result.offers);
          setPaidCropIds(result.paidCropIds || []);
        } else if (response.status === 401 || response.status === 404) {
          // Token is invalid or seller no longer exists
          localStorage.removeItem("sellerToken");
          window.location.href = "/auth";
        } else {
          console.error("Failed to fetch dashboard data");
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("sellerToken");
      await fetch(`http://localhost:5000/api/seller/dashboard/offer/${id}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'accept' })
      });
      setOfferList(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (id) => {
    try {
      const token = localStorage.getItem("sellerToken");
      await fetch(`http://localhost:5000/api/seller/dashboard/offer/${id}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ action: 'decline' })
      });
      setOfferList(prev => prev.filter(o => o._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddCrop = async (cropData) => {
    try {
      const token = localStorage.getItem("sellerToken");

      const response = await fetch("http://localhost:5000/api/seller/dashboard/crop", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(cropData)
      });

      if (response.ok) {
        const newCrop = await response.json();
        // Update local state to show the new crop immediately
        setData(prev => ({
          ...prev,
          crops: [...(prev.crops || []), newCrop],
          stats: {
            ...prev.stats,
            totalListings: (prev.stats?.totalListings || 0) + 1
          }
        }));
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditCrop = async (cropId, cropData) => {
    try {
      const token = localStorage.getItem("sellerToken");
      const response = await fetch(`http://localhost:5000/api/seller/dashboard/crop/${cropId}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(cropData)
      });
      if (response.ok) {
        const updatedCrop = await response.json();
        setData(prev => ({
          ...prev,
          crops: prev.crops.map(c => c._id === cropId ? updatedCrop : c)
        }));
        setEditingCrop(null);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to update crop');
      }
    } catch (err) {
      console.error(err);
      alert('Server error, please try again.');
    }
  };

  const handleUpdateProfile = async (newName) => {
    try {
      const token = localStorage.getItem("sellerToken");
      const response = await fetch('http://localhost:5000/api/seller/dashboard/profile', {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name: newName })
      });
      if (response.ok) {
        const updated = await response.json();
        setData(prev => ({ ...prev, seller: { ...prev.seller, name: updated.name } }));
        setIsProfileModalOpen(false);
      } else {
        const err = await response.json();
        alert(err.message || 'Failed to update name');
      }
    } catch (err) {
      console.error(err);
      alert('Server error, please try again.');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#f3f4ef]">Loading...</div>;
  }

  const { seller, stats, crops, salesData } = data || {};

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  };

  return (
    <div style={{ background: "#f3f4ef", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <AddCropModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSubmit={handleAddCrop} />
      <EditCropModal crop={editingCrop} onClose={() => setEditingCrop(null)} onSubmit={handleEditCrop} />
      <EditProfileModal
        currentName={seller?.name}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSubmit={handleUpdateProfile}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 99px; }
      `}</style>

      {/* ── Topbar ── */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10" style={{ animation: "fadeUp 0.3s ease both" }}>
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">

          </div>
          <div className="flex items-center gap-3">
            {/* Language Selector */}


            <button onClick={() => setIsProfileModalOpen(true)} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white uppercase"
                style={{ background: "linear-gradient(135deg, #2d6a4f, #40916c)" }}>
                {getInitials(seller?.name)}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-sm font-semibold text-gray-900 leading-tight flex items-center gap-1">
                  {seller?.name || "Farmer"}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                </div>
                <div className="text-xs text-gray-400">{t('farmer')} • {seller?.location || "Not specified"}</div>
              </div>
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("sellerToken");
                window.location.href = "/auth";
              }}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600"
              title="Logout"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* ── Hero Banner ── */}
        <div className="rounded-3xl overflow-hidden relative" style={{
          background: "linear-gradient(120deg, #1a5c38 0%, #2d8a55 60%, #52c27a 100%)",
          animation: "fadeUp 0.4s ease both", animationDelay: "0.05s"
        }}>
          <div className="absolute inset-0 opacity-10"
            style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 0%, transparent 60%)" }} />
          <div className="relative px-8 py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white mb-3"
                style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
                {t('activeFarmer')}
              </div>
              <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                {t('welcomeBack')}, {seller?.name?.split(' ')[0] || "Farmer"} 👋
              </h2>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.75)" }}>
                You have {stats?.newOffersCount || 0} pending offers.
              </p>
            </div>
            <button onClick={() => setIsModalOpen(true)} className="self-start sm:self-auto flex-shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-white hover:bg-gray-50 transition-all"
              style={{ color: "#1a5c38" }}>
              <span className="text-lg">＋</span> {t('addCropListing')}
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="📋" label={t('totalListings')} value={stats?.totalListings ?? 0} badge={stats?.totalListingsBadge || "0 this week"} delay="0.1s" />
          <StatCard icon="👥" label={t('activeBuyers')} value={stats?.activeBuyers ?? 0} badge={stats?.activeBuyersBadge || "0 active"} delay="0.15s" />
          <StatCard icon="₹" label={t('revenueEstimate')} value={stats?.revenueEstimate || "₹0"} badge={stats?.revenueEstimateBadge || "No revenue yet"} delay="0.2s" />
          <StatCard icon="📈" label={t('avgPrice')} value={stats?.avgPrice || "₹0"} badge={stats?.avgPriceBadge || "No crops yet"} delay="0.25s" />
        </div>

        

        {/* ── Offers Received ── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
          style={{ animation: "fadeUp 0.4s ease both", animationDelay: "0.4s" }}>
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="font-bold text-gray-900">{t('offersReceived')}</h3>
              <p className="text-xs text-gray-400">{offerList?.length || 0} {t('newOffers24h')}</p>
            </div>
            <button className="text-sm font-semibold hover:underline" style={{ color: "#2d6a4f" }}>{t('viewAll')}</button>
          </div>
          <div className="divide-y divide-gray-50">
            {!offerList || offerList.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm">{t('noPendingOffers')}</div>
            ) : (
              offerList.map(offer => (
                <OfferRow key={offer._id} offer={offer} onAccept={handleAccept} onDecline={handleDecline} />
              ))
            )}
          </div>
        </div>

        {/* ── My Listed Crops ── */}
        <div style={{ animation: "fadeUp 0.4s ease both", animationDelay: "0.45s" }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-lg">{t('myListedCrops')}</h3>
            <button className="text-sm font-semibold hover:underline" style={{ color: "#2d6a4f" }}>{t('viewAll')} ({crops?.length || 0})</button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {crops?.map((crop, i) => (
              <CropCard
                key={crop._id || i}
                crop={crop}
                onEdit={setEditingCrop}
                onViewOffers={setViewingCropOffers}
                isPaid={paidCropIds.includes(crop._id?.toString())}
              />
            ))}
          </div>
        </div>

        <div className="h-4" />
      </div>

      {/* ── Crop Offers Modal ── */}
      {viewingCropOffers && (
        <CropOffersModal
          crop={viewingCropOffers}
          onClose={() => setViewingCropOffers(null)}
        />
      )}
    </div>
  );
}