import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/* ── CSS-in-JS styles injected once ── */
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&family=DM+Serif+Display&display=swap');

  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { scroll-behavior: smooth; }
  body {
    font-family: 'DM Sans', sans-serif;
    background: #f4f5f0;
    min-height: 100vh;
    color: #1a1f18;
  }

  :root {
    --green:        #2d7a3a;
    --green-mid:    #3a9149;
    --green-light:  #4caf63;
    --green-pale:   #edf5ee;
    --green-accent: #f0faf1;
    --text:         #1a1f18;
    --muted:        #6b7269;
    --card:         #ffffff;
    --border:       #e2e8e0;
    --red:          #e53935;
    --gold:         #e8a022;
  }

  input[type=range] {
    -webkit-appearance: none;
    width: 100%;
    height: 5px;
    border-radius: 4px;
    background: linear-gradient(to right, var(--green) 0%, var(--green) var(--val, 100%), #dde8dd var(--val, 100%), #dde8dd 100%);
    outline: none;
    cursor: pointer;
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--green);
    border: 2.5px solid #fff;
    box-shadow: 0 1px 6px rgba(45,122,58,0.35);
    cursor: pointer;
  }
  input[type=range]::-moz-range-thumb {
    width: 18px; height: 18px;
    border-radius: 50%;
    background: var(--green);
    border: 2.5px solid #fff;
    box-shadow: 0 1px 6px rgba(45,122,58,0.35);
    cursor: pointer;
  }

  select {
    -webkit-appearance: none;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b7269' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 12px center;
    padding-right: 34px !important;
  }

  .crop-card {
    background: #fff;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--border);
    transition: box-shadow 0.22s ease, transform 0.22s ease;
    cursor: pointer;
  }
  .crop-card:hover {
    box-shadow: 0 10px 36px rgba(45,122,58,0.14);
    transform: translateY(-3px);
  }

  .stat-card {
    background: #fff;
    border-radius: 16px;
    padding: 20px 22px;
    border: 1px solid var(--border);
    transition: box-shadow 0.2s;
  }
  .stat-card:hover { box-shadow: 0 4px 20px rgba(45,122,58,0.10); }

  .btn-contact {
    flex: 1;
    padding: 9px 0;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: #fff;
    color: var(--text);
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.15s, border-color 0.15s;
  }
  .btn-contact:hover { background: var(--green-accent); border-color: var(--green-mid); }

  .btn-offer {
    flex: 1.5;
    padding: 9px 0;
    border-radius: 10px;
    border: none;
    background: var(--green);
    color: #fff;
    font-weight: 700;
    font-size: 13px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: background 0.15s;
  }
  .btn-offer:hover { background: var(--green-mid); }

  .btn-mandi {
    background: #fff;
    border: none;
    border-radius: 12px;
    padding: 14px 24px;
    font-weight: 700;
    font-size: 14px;
    color: var(--text);
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.12);
    font-family: 'DM Sans', sans-serif;
    transition: box-shadow 0.15s, transform 0.15s;
  }
  .btn-mandi:hover { box-shadow: 0 6px 28px rgba(0,0,0,0.18); transform: translateY(-1px); }

  .btn-wish {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 34px;
    height: 34px;
    border-radius: 50%;
    background: #fff;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
    transition: transform 0.18s;
  }
  .btn-wish:hover { transform: scale(1.15); }

  .sidebar-btn {
    background: none;
    border: none;
    cursor: pointer;
    padding: 6px;
    border-radius: 8px;
    color: var(--text);
    font-size: 18px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.15s;
  }
  .sidebar-btn:hover { background: var(--green-accent); }

  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #ccd6cc; border-radius: 3px; }

  .search-input {
    width: 100%;
    padding: 10px 12px 10px 36px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    background: #fafafa;
    color: var(--text);
    transition: border-color 0.15s;
  }
  .search-input:focus { border-color: var(--green-mid); background: #fff; }

  .filter-select {
    width: 100%;
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    background: #fafafa;
    color: var(--text);
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .filter-select:focus { border-color: var(--green-mid); background: #fff; }

  .notif-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 20px;
    position: relative;
    padding: 4px;
    border-radius: 8px;
    transition: background 0.15s;
  }
  .notif-btn:hover { background: var(--green-accent); }

  .logout-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: var(--muted);
    padding: 4px 8px;
    border-radius: 8px;
    transition: background 0.15s, color 0.15s;
  }
  .logout-btn:hover { background: #fee2e2; color: var(--red); }

  .empty-state {
    text-align: center;
    padding: 80px 0;
    color: var(--muted);
    font-size: 16px;
    grid-column: 1 / -1;
  }

  @media (max-width: 1100px) {
    .crop-grid { grid-template-columns: repeat(3, 1fr) !important; }
  }
  @media (max-width: 800px) {
    .crop-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
    .filter-row { flex-direction: column !important; }
    .hero-inner { flex-direction: column !important; gap: 20px !important; }
    .btn-mandi { width: 100%; justify-content: center; }
  }
  @media (max-width: 520px) {
    .crop-grid { grid-template-columns: 1fr !important; }
    .stats-grid { grid-template-columns: 1fr !important; }
  }
`;

const GRADE_COLORS = { Premium: "#2d7a3a", A: "#1a6fb0", B: "#b06a1a" };

/* ── SUB-COMPONENTS ── */
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 11,
        background: "var(--green)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 10px rgba(45,122,58,0.30)"
      }}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path d="M12 2C8.5 2 4 6.5 4 12c0 3.2 1.8 5.5 4 7 1.5 1 3 1.5 4 1.5s2.5-.5 4-1.5c2.2-1.5 4-3.8 4-7 0-5.5-4.5-10-8-10z"
            stroke="white" strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
          <path d="M12 21V11" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
          <path d="M8.5 9.5C10 10.5 11.5 12 12 13.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
          <path d="M15.5 7.5C14 8.5 12.5 10 12 11.5" stroke="white" strokeWidth="1.6" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{
        fontFamily: "'DM Serif Display', serif",
        fontSize: 23,
        color: "var(--green)",
        letterSpacing: "-0.3px",
        lineHeight: 1
      }}>
        KrishiMitra
      </span>
    </div>
  );
}

function StarRating({ val }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: "#e8a022", fontWeight: 700, fontSize: 13 }}>
      ★ {val}
    </span>
  );
}

function CropCard({ crop, index, initialWishlisted, initialOfferStatus, initialPaymentStatus, offerId, onToggle, onOffer, onPay }) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted || false);
  const [imgError, setImgError] = useState(false);
  const [offerStatus, setOfferStatus] = useState(initialOfferStatus || 'none');
  const [paymentStatus, setPaymentStatus] = useState(initialPaymentStatus || 'unpaid');
  const [paying, setPaying] = useState(false);

  useEffect(() => { setWishlisted(initialWishlisted); }, [initialWishlisted]);
  useEffect(() => { if (initialOfferStatus) setOfferStatus(initialOfferStatus); }, [initialOfferStatus]);
  useEffect(() => { if (initialPaymentStatus) setPaymentStatus(initialPaymentStatus); }, [initialPaymentStatus]);

  const handleWishClick = () => {
    setWishlisted(w => !w);
    if (onToggle) onToggle(crop._id);
  };

  const handleOfferClick = async () => {
    if (onOffer && offerStatus === 'none') {
      const success = await onOffer(crop._id, crop.sellerId, crop.price.toString());
      if (success) setOfferStatus('pending');
    }
  };

  const handlePayClick = async () => {
    if (!offerId || paying) return;
    setPaying(true);
    const paid = await onPay(offerId, crop._id);
    if (paid) setPaymentStatus('paid');
    setPaying(false);
  };

  return (
    <div className="crop-card" style={{ animationDelay: `${index * 60}ms` }}>
      <div style={{ position: "relative", height: 185, background: "#e8f5e9", overflow: "hidden" }}>
        {!imgError ? (
          <img src={crop.img} alt={crop.name} onError={() => setImgError(true)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>🌾</div>
        )}
        <div style={{
          position: "absolute", top: 10, left: 10,
          background: GRADE_COLORS[crop.grade], color: "#fff", fontSize: 11, fontWeight: 700,
          padding: "4px 11px", borderRadius: 20, boxShadow: "0 1px 6px rgba(0,0,0,0.18)"
        }}>
          Grade {crop.grade}
        </div>
        <button className="btn-wish" onClick={handleWishClick}
          title={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          style={{ color: wishlisted ? "var(--red)" : "#aaa" }}>
          {wishlisted ? "♥" : "♡"}
        </button>
      </div>

      <div style={{ padding: "15px 16px 17px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 3 }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: "var(--text)" }}>{crop.name}</span>
        </div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 2 }}>by {crop.farmer}</div>
        <div style={{ fontSize: 12.5, color: "var(--muted)", marginBottom: 14, display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="11" height="13" viewBox="0 0 11 13" fill="none">
            <path d="M5.5 1C3.01 1 1 3.01 1 5.5c0 3.375 4.5 6.5 4.5 6.5S10 8.875 10 5.5C10 3.01 7.99 1 5.5 1z" stroke="#6b7269" strokeWidth="1.2" fill="none"/>
            <circle cx="5.5" cy="5.5" r="1.3" fill="#6b7269"/>
          </svg>
          {crop.location}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2, letterSpacing: "0.3px", textTransform: "uppercase", fontWeight: 600 }}>Price</div>
            <span style={{ fontWeight: 800, fontSize: 19, color: "var(--green)" }}>{crop.priceStr}</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{crop.unit}</span>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 2, letterSpacing: "0.3px", textTransform: "uppercase", fontWeight: 600 }}>Available</div>
            <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{crop.available}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          {offerStatus === 'none' && (
            <button className="btn-offer" style={{ width: "100%" }} onClick={handleOfferClick}>Send Offer</button>
          )}
          {offerStatus === 'pending' && (
            <button className="btn-offer" style={{ width: "100%", background: "#e5e7eb", color: "var(--muted)", cursor: "not-allowed", border: "none", pointerEvents: "none" }} disabled>
              ⏳ Waiting for seller response...
            </button>
          )}
          {offerStatus === 'accepted' && paymentStatus === 'unpaid' && (
            <div style={{ display: "flex", gap: 8, width: "100%" }}>
              <span style={{
                flex: 1, padding: "9px 0", borderRadius: 10,
                background: "#fef3c7", color: "#92400e", fontWeight: 700, fontSize: 13,
                textAlign: "center", border: "1.5px solid #fde68a"
              }}>💰 Unpaid</span>
              <button className="btn-offer"
                style={{ flex: 1, background: paying ? "#aaa" : "var(--green)", border: "none", cursor: paying ? "not-allowed" : "pointer" }}
                onClick={handlePayClick} disabled={paying}>
                {paying ? "Processing..." : "💳 Pay Now"}
              </button>
            </div>
          )}
          {offerStatus === 'accepted' && paymentStatus === 'paid' && (
            <span style={{
              width: "100%", padding: "9px 0", borderRadius: 10,
              background: "#dcfce7", color: "#16a34a", fontWeight: 700, fontSize: 13,
              textAlign: "center", border: "1.5px solid #bbf7d0", display: "block"
            }}>✅ Paid</span>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── EDIT PROFILE MODAL ── */
function EditProfileModal({ currentName, isOpen, onClose, onSubmit }) {
  const [name, setName] = useState(currentName || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { setName(currentName || ""); }, [currentName]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!name.trim()) { setError("Name cannot be empty"); return; }
    setLoading(true); setError("");
    await onSubmit(name.trim());
    setLoading(false);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: "32px 28px",
        width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.18)"
      }}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6, color: "var(--text)" }}>Edit your name</div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 22 }}>This will update your display name on the dashboard.</div>
        {error && <div style={{ color: "var(--red)", fontSize: 13, marginBottom: 12 }}>{error}</div>}
        <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", display: "block", marginBottom: 6 }}>Full name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 12,
            border: "1.5px solid var(--border)", fontSize: 14,
            outline: "none", marginBottom: 20,
            fontFamily: "'DM Sans', sans-serif", color: "var(--text)"
          }}
          autoFocus
        />
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 12,
              border: "1.5px solid var(--border)", background: "#fff",
              fontWeight: 600, fontSize: 14, cursor: "pointer", color: "var(--muted)",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >Cancel</button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              flex: 1, padding: "10px 0", borderRadius: 12,
              border: "none", background: "var(--green)", color: "#fff",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif",
              opacity: loading ? 0.7 : 1
            }}
          >{loading ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}

/* ── MAIN COMPONENT ── */
export default function BuyerDashboard() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [cropFilter, setCropFilter] = useState("All crops");
  const [stateFilter, setStateFilter] = useState("All states");
  const [maxPrice, setMaxPrice] = useState(50000);
  const [buyerName, setBuyerName] = useState("");
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [crops, setCrops] = useState([]);
  const [statsData, setStatsData] = useState({
    activeOrders: 0,
    wishlistCount: 0,
    wishlist: [],
    delivered: 0,
    totalSpent: "₹0"
  });

  // Fetch buyer name and crops from backend on mount
  useEffect(() => {
    const token = localStorage.getItem("buyerToken");
    if (!token) { navigate("/buyer-auth"); return; }
    
    // Fetch profile
    fetch("http://krushimitra-business.vercel.app/api/buyer/dashboard/profile", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (data.name) setBuyerName(data.name); })
      .catch(() => {});

    // Fetch crops
    fetch("http://krushimitra-business.vercel.app/api/buyer/dashboard/crops", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setCrops(data);
      })
      .catch(err => console.error("Error fetching crops:", err));

    // Fetch stats
    fetch("http://krushimitra-business.vercel.app/api/buyer/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data) setStatsData(data);
      })
      .catch(err => console.error("Error fetching stats:", err));
  }, [navigate]);

  const handleUpdateProfile = async (newName) => {
    const token = localStorage.getItem("buyerToken");
    try {
      const res = await fetch("http://krushimitra-business.vercel.app/api/buyer/dashboard/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: newName })
      });
      const data = await res.json();
      if (res.ok) setBuyerName(data.name);
    } catch (err) {
      console.error("Failed to update profile:", err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("buyerToken");
    navigate("/buyer-auth");
  };

  const handleToggleWishlist = async (cropId) => {
    try {
      const token = localStorage.getItem("buyerToken");
      const res = await fetch("http://krushimitra-business.vercel.app/api/buyer/dashboard/wishlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ cropId })
      });
      const data = await res.json();
      if (res.ok) {
        setStatsData(prev => ({
          ...prev,
          wishlistCount: data.wishlistCount,
          wishlist: data.isWishlisted 
            ? [...(prev.wishlist || []), cropId]
            : (prev.wishlist || []).filter(id => id !== cropId)
        }));
      }
    } catch (err) {
      console.error("Error toggling wishlist", err);
    }
  };

  const handleSendOffer = async (cropId, sellerId, priceOffered, unit) => {
    try {
      const token = localStorage.getItem("buyerToken");
      const res = await fetch("http://krushimitra-business.vercel.app/api/buyer/dashboard/offer", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cropId, sellerId, priceOffered: `₹${priceOffered}${unit || ''}` })
      });
      const data = await res.json();
      if (res.ok) return true;
      alert("Failed to send offer: " + data.message);
      return false;
    } catch (err) {
      console.error("Error sending offer", err);
      alert("Error sending offer");
      return false;
    }
  };

  const handlePay = async (offerId, cropId) => {
    try {
      const token = localStorage.getItem("buyerToken");

      // Step 1: Create Razorpay order on backend
      const orderRes = await fetch("http://krushimitra-business.vercel.app/api/buyer/dashboard/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ offerId })
      });
      const orderData = await orderRes.json();
      if (!orderRes.ok) { alert("Could not initiate payment: " + orderData.message); return false; }

      // Step 2: Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
      }

      // Step 3: Open Razorpay checkout
      return new Promise((resolve) => {
        const options = {
          key: orderData.key,
          amount: orderData.amount,
          currency: orderData.currency,
          name: "KrishiMitra",
          description: "Crop Payment",
          order_id: orderData.orderId,
          handler: async (response) => {
            // Step 4: Verify payment on backend
            const verifyRes = await fetch("http://krushimitra-business.vercel.app/api/buyer/dashboard/pay", {
              method: "POST",
              headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                offerId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              })
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              // Re-fetch stats immediately to update the dashboard cards
              try {
                const statsRes = await fetch("http://krushimitra-business.vercel.app/api/buyer/dashboard/stats", {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const updatedStats = await statsRes.json();
                if (updatedStats) setStatsData(updatedStats);
              } catch (e) {
                console.error("Failed to refresh stats", e);
              }
              resolve(true);
            } else {
              alert("Payment verification failed: " + verifyData.message);
              resolve(false);
            }
          },
          prefill: { name: buyerName },
          theme: { color: "#2d7a3a" },
          modal: {
            ondismiss: () => resolve(false)
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response) => {
          alert("Payment failed: " + response.error.description);
          resolve(false);
        });
        rzp.open();
      });
    } catch (err) {
      console.error("Error processing payment", err);
      alert("Error processing payment");
      return false;
    }
  };
  // Inject global styles and clean up on unmount to prevent leaking to other pages
  useEffect(() => {
    let styleEl = document.getElementById("krishimitra-styles");
    if (typeof document !== "undefined" && !styleEl) {
      styleEl = document.createElement("style");
      styleEl.id = "krishimitra-styles";
      styleEl.textContent = globalStyles;
      document.head.appendChild(styleEl);
    }
    return () => {
      if (styleEl && styleEl.parentNode) {
        styleEl.parentNode.removeChild(styleEl);
      }
    };
  }, []);

  const handleRangeChange = useCallback((e) => {
    const val = Number(e.target.value);
    setMaxPrice(val);
    const pct = (val / 50000) * 100;
    e.target.style.setProperty("--val", pct + "%");
  }, []);

  const uniqueCrops = ["All crops", ...new Set(crops.map(c => c.name).filter(Boolean))];
  const uniqueStates = ["All states", ...new Set(crops.map(c => c.location ? c.location.split(",").pop().trim() : "").filter(Boolean))];

  const filtered = crops.filter(c => {
    const matchSearch = !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.farmer.toLowerCase().includes(search.toLowerCase());
    const matchCrop = cropFilter === "All crops" || c.name === cropFilter;
    const matchState = stateFilter === "All states" || (c.location && c.location.includes(stateFilter));
    const matchPrice = c.price <= maxPrice;
    return matchSearch && matchCrop && matchState && matchPrice;
  });

  const STATS = [
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="7" cy="17" r="1.5" stroke="#2d7a3a" strokeWidth="1.4" fill="none"/>
          <circle cx="14" cy="17" r="1.5" stroke="#2d7a3a" strokeWidth="1.4" fill="none"/>
          <path d="M1 2h2l2.5 9h7l2-6H5.5" stroke="#2d7a3a" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      ),
      label: t('buyerActiveOrders'), value: statsData.activeOrders.toString(), sub: t('buyerToday'), subColor: "var(--green)"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 16s-7-4.5-7-9a5 5 0 0110 0c0 4.5-3 9-3 9z" stroke="#2d7a3a" strokeWidth="1.4" fill="none" strokeLinejoin="round"/>
        </svg>
      ),
      label: t('buyerWishlist'), value: statsData.wishlistCount.toString(), sub: "", subColor: ""
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <rect x="2" y="5" width="16" height="12" rx="2" stroke="#2d7a3a" strokeWidth="1.4" fill="none"/>
          <path d="M6 9l3 3 5-5" stroke="#2d7a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      label: t('buyerDelivered'), value: statsData.delivered.toString(), sub: t('buyerThisMonth'), subColor: "var(--green)"
    },
    {
      icon: (
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M3 14l4-4 3 3 7-8" stroke="#2d7a3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
        </svg>
      ),
      label: t('buyerTotalSpent'), value: statsData.totalSpent.toString(), sub: t('buyerVsMarket'), subColor: "var(--red)"
    },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#f4f5f0" }}>
      <EditProfileModal
        currentName={buyerName}
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSubmit={handleUpdateProfile}
      />

      {/* ── NAVBAR ── */}
      <nav style={{
        background: "#fff",
        borderBottom: "1px solid var(--border)",
        padding: "0 36px",
        height: 62,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 200,
        boxShadow: "0 1px 0 var(--border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button className="sidebar-btn" title="Toggle sidebar">
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
              <rect x="0" y="0" width="18" height="2" rx="1" fill="currentColor"/>
              <rect x="0" y="6" width="12" height="2" rx="1" fill="currentColor"/>
              <rect x="0" y="12" width="18" height="2" rx="1" fill="currentColor"/>
            </svg>
          </button>
          <Logo />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Language Selector */}
          <select
            value={i18n.language}
            onChange={e => {
              const lang = e.target.value;
              i18n.changeLanguage(lang);
              localStorage.setItem('krishimitra_language', lang);
            }}
            style={{
              fontSize: 12, fontWeight: 600,
              border: "1.5px solid var(--border)",
              borderRadius: 8, padding: "5px 8px",
              outline: "none", background: "#fff",
              color: "var(--muted)", cursor: "pointer",
              fontFamily: "'DM Sans', sans-serif"
            }}
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="kn">KN</option>
          </select>

          <div
            style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}
            onClick={() => setIsProfileModalOpen(true)}
            title="Edit your name"
          >
            <div style={{
              width: 38, height: 38, borderRadius: "50%",
              background: "var(--green)", color: "#fff",
              fontWeight: 800, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 8px rgba(45,122,58,0.30)"
            }}>
              {buyerName
                ? buyerName.trim().split(" ").length >= 2
                  ? (buyerName.trim().split(" ")[0][0] + buyerName.trim().split(" ")[1][0]).toUpperCase()
                  : buyerName[0].toUpperCase()
                : "B"}
            </div>
            <div style={{ lineHeight: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text)", marginBottom: 2 }}>
                {buyerName || "Buyer"}
              </div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{t('buyerBuyer')}</div>
            </div>
          </div>

          <button className="logout-btn" title="Sign out" onClick={handleLogout}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M7 2H3a1 1 0 00-1 1v12a1 1 0 001 1h4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              <path d="M12 5l4 4-4 4M16 9H7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <main style={{ maxWidth: 1240, margin: "0 auto", padding: "30px 28px 60px" }}>

        {/* ── HERO BANNER ── */}
        <div style={{
          background: "linear-gradient(125deg, #1e5c28 0%, #2d7a3a 45%, #4caf63 100%)",
          borderRadius: 22,
          padding: "34px 40px",
          marginBottom: 28,
          position: "relative",
          overflow: "hidden"
        }}>
          <div style={{ position: "absolute", right: -40, top: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }}/>
          <div style={{ position: "absolute", right: 80, bottom: -60, width: 170, height: 170, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }}/>
          <div style={{ position: "absolute", left: -20, bottom: -30, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.03)" }}/>

          <div className="hero-inner" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{
                background: "rgba(255,255,255,0.18)",
                backdropFilter: "blur(4px)",
                borderRadius: 20,
                padding: "6px 16px",
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                marginBottom: 16,
                border: "1px solid rgba(255,255,255,0.2)"
              }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="white" strokeWidth="1.3" fill="none"/>
                  <path d="M4 7l2 2 4-4" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{t('buyerVerified')}</span>
              </div>

              <h1 style={{
                color: "#fff",
                fontSize: 34,
                fontFamily: "'DM Serif Display', serif",
                marginBottom: 10,
                lineHeight: 1.15,
                letterSpacing: "-0.5px"
              }}>
                Find the freshest harvest 🌾
              </h1>
              <p style={{ color: "rgba(255,255,255,0.80)", fontSize: 15.5 }}>
                {t('buyerHeroSub', { 
                  listings: crops.length, 
                  states: uniqueStates.length > 1 ? uniqueStates.length - 1 : 0 
                })}
              </p>
            </div>

            <button className="btn-mandi">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 12l4-5 3 3 5-7" stroke="#2d7a3a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('buyerMandiRates')}
            </button>
          </div>
        </div>

        {/* ── STATS GRID ── */}
        <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
          {STATS.map((s, i) => (
            <div className="stat-card" key={i}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div style={{
                  width: 42, height: 42, borderRadius: 11,
                  background: "var(--green-accent)",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  {s.icon}
                </div>
                {s.sub && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: s.subColor }}>
                    {s.sub}
                  </span>
                )}
              </div>
              <div style={{ fontSize: 30, fontWeight: 800, color: "var(--text)", marginBottom: 5, letterSpacing: "-0.5px" }}>
                {s.value}
              </div>
              <div style={{ fontSize: 13.5, color: "var(--muted)", fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── SEARCH & FILTER ── */}
        <div style={{
          background: "#fff",
          borderRadius: 18,
          padding: "22px 26px",
          marginBottom: 26,
          border: "1px solid var(--border)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M1 4h14M3 8h10M5 12h6" stroke="#2d7a3a" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span style={{ fontWeight: 700, fontSize: 16, color: "var(--text)" }}>{t('buyerSearchFilter')}</span>
          </div>

          <div className="filter-row" style={{ display: "flex", gap: 14, alignItems: "center" }}>
            <div style={{ flex: 2, minWidth: 180, position: "relative" }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="6" cy="6" r="4.5" stroke="#6b7269" strokeWidth="1.4" fill="none"/>
                <path d="M9.5 9.5l2.5 2.5" stroke="#6b7269" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input
                className="search-input"
                type="text"
                placeholder={t('buyerSearchPlaceholder')}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div style={{ flex: 1, minWidth: 130 }}>
              <select className="filter-select" value={cropFilter} onChange={e => setCropFilter(e.target.value)}>
                {uniqueCrops.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1, minWidth: 130 }}>
              <select className="filter-select" value={stateFilter} onChange={e => setStateFilter(e.target.value)}>
                {uniqueStates.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: 1.6, minWidth: 200 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 500 }}>{t('buyerMaxPrice')}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text)" }}>₹{maxPrice.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="0" max="50000" step="100"
                value={maxPrice}
                onChange={handleRangeChange}
                style={{ "--val": `${(maxPrice / 50000) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* ── CROP GRID ── */}
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: "var(--text)", marginBottom: 22, display: "flex", alignItems: "center", gap: 8 }}>
            {t('buyerAvailableCrops')}
            <span style={{
              background: "var(--green-pale)", color: "var(--green)",
              fontSize: 13, fontWeight: 700,
              padding: "2px 10px", borderRadius: 20
            }}>
              {filtered.length}
            </span>
          </h2>

          <div className="crop-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
            {filtered.length > 0
              ? filtered.map((c, i) => (
                  <CropCard
                    key={`${c.farmer}-${i}`}
                    crop={c}
                    index={i}
                    initialWishlisted={(statsData.wishlist || []).includes(c._id)}
                    initialOfferStatus={(statsData.offersMap || {})[c._id]?.status || 'none'}
                    initialPaymentStatus={(statsData.offersMap || {})[c._id]?.paymentStatus || 'unpaid'}
                    offerId={(statsData.offersMap || {})[c._id]?.offerId}
                    onToggle={handleToggleWishlist}
                    onOffer={(cropId, sellerId, priceOffered) => handleSendOffer(cropId, sellerId, priceOffered, c.unit)}
                    onPay={handlePay}
                  />
                ))
              : (
                <div className="empty-state">
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🌾</div>
                  <div style={{ fontWeight: 600, marginBottom: 6 }}>{t('buyerNoResults')}</div>
                  <div style={{ fontSize: 14 }}>{t('buyerNoResultsSub')}</div>
                </div>
              )
            }
          </div>
        </div>
      </main>
    </div>
  );
}