import React, { useState, useEffect } from 'react';
import { Outlet, ServicePreset, PaymentArrangement, PaymentChannel, User } from '../../types';
import { store } from '../../db/store';
import { ChevronDown } from 'lucide-react';

interface OutletTransactionFormProps {
  outlet: Outlet;
  user: User;
  onSuccess: (newTxId: string, channel: PaymentChannel) => void;
  onCancel: () => void;
}

const OUTLET_FORM_SUBTITLES: Record<string, string> = {
  pickleball: 'New pickleball court booking',
  hostel: 'New room reservation or walk in stay',
  gym: 'New membership, walk in or session bundle',
  pool: 'Walk in guests Monday to Thursday, hostel guests free',
  ktv: 'Room booking with consumable food and drink package',
  fnb: 'Audit a bill to walk ins, function guests or a KTV room',
  billiards: 'Hourly table rental',
  tabletennis: 'Hourly table rental, upstairs',
  parking: 'Free for checked in guests, paid for outsiders',
  events: 'Private functions, concerts and location shoots',
};

export const OutletTransactionForm: React.FC<OutletTransactionFormProps> = ({
  outlet,
  user,
  onSuccess,
  onCancel,
}) => {
  const presets = store.getServices(outlet.id);

  const [selectedServiceId, setSelectedServiceId] = useState<string>('');
  const [serviceName, setServiceName] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentArrangement, setPaymentArrangement] = useState<PaymentArrangement>('Full Payment');
  const [paymentChannel, setPaymentChannel] = useState<PaymentChannel>('QRPh');
  const [paymentTiming, setPaymentTiming] = useState<'upfront' | 'pay_later'>('upfront');

  // 1. Pickleball
  const [court, setCourt] = useState<'Al Fresco (Ground Floor)' | 'Indoor (2nd Floor)'>('Al Fresco (Ground Floor)');
  const [pax, setPax] = useState<number>(2);
  const [hours, setHours] = useState<number>(1);
  const [paddleRent, setPaddleRent] = useState<number>(2);
  const [ballRent, setBallRent] = useState<number>(1);

  // 2. Hostel
  const [roomType, setRoomType] = useState<'Small Room' | 'Suite Room'>('Small Room');
  const [bookingSource, setBookingSource] = useState<'Walk-in' | 'Agoda' | 'Traveloka'>('Walk-in');
  const [checkIn, setCheckIn] = useState<string>(new Date().toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState<string>(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [numberOfNights, setNumberOfNights] = useState<number>(1);

  // 3. Gym
  const [age, setAge] = useState<number>(24);
  const [membershipStart, setMembershipStart] = useState<string>(new Date().toISOString().split('T')[0]);
  const [membershipType, setMembershipType] = useState<string>('Member');
  const [gymPlan, setGymPlan] = useState<string>('Monthly');
  const [trainerProgram, setTrainerProgram] = useState<string>('General Fitness');

  // 4. Pool
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(1);
  const [isHostelGuest, setIsHostelGuest] = useState<boolean>(false);
  const [visitDay, setVisitDay] = useState<string>('Wednesday');

  // 5. KTV
  const [ktvRoom, setKtvRoom] = useState<'Small Room A (up to 10 pax)' | 'Small Room B (up to 10 pax)' | 'Large Room (20 to 25+ pax)'>('Small Room A (up to 10 pax)');
  const [ktvPax, setKtvPax] = useState<number>(8);
  const [ktvPackage, setKtvPackage] = useState<string>('Food & drink package');

  // 6. F&B Direct Form
  const [auditedTo, setAuditedTo] = useState<'Walk-in Client' | 'Function Guest' | 'KTV Room User'>('Walk-in Client');
  const [tableOrRoomNo, setTableOrRoomNo] = useState<string>('Table 4');

  // 7. Billiards
  const [billiardsTable, setBilliardsTable] = useState<'Table 1' | 'Table 2'>('Table 1');
  const [billiardsHours, setBilliardsHours] = useState<number>(1);

  // 8. Table Tennis
  const [ttTable, setTtTable] = useState<'Table 1' | 'Table 2' | 'Table 3'>('Table 2');
  const [ttHours, setTtHours] = useState<number>(1);

  // 9. Parking
  const [plateNumber, setPlateNumber] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<'Car / SUV' | 'Motorcycle' | 'Van' | 'Bicycle / Free'>('Car / SUV');
  const [parkingType, setParkingType] = useState<'Day' | 'Night' | 'Overnight'>('Day');
  const [isCheckedInGuest, setIsCheckedInGuest] = useState<boolean>(false);

  // 10. Events
  const [eventType, setEventType] = useState<string>('Corporate Event');
  const [eventDate, setEventDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [headcount, setHeadcount] = useState<number>(80);
  const [spaceReserved, setSpaceReserved] = useState<string>('Grand Function Terrace');

  const autoDateTime = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  useEffect(() => {
    if (presets.length > 0 && !selectedServiceId) {
      applyPreset(presets[0]);
    }
  }, [presets]);

  const applyPreset = (preset: ServicePreset) => {
    setSelectedServiceId(preset.id);
    setServiceName(preset.name);
    setAmount(preset.defaultPrice);

    const fields = preset.presetFields || {};
    if (fields.court) setCourt(fields.court);
    if (fields.pax) {
      setPax(fields.pax);
      setKtvPax(fields.pax);
    }
    if (fields.hours) {
      setHours(fields.hours);
      setBilliardsHours(fields.hours);
      setTtHours(fields.hours);
    }
    if (fields.paddleRent !== undefined) setPaddleRent(fields.paddleRent);
    if (fields.ballRent !== undefined) setBallRent(fields.ballRent);

    if (fields.roomType) setRoomType(fields.roomType);
    if (fields.bookingSource) setBookingSource(fields.bookingSource);
    if (fields.numberOfNights) setNumberOfNights(fields.numberOfNights);

    if (fields.plan) setGymPlan(fields.plan);
    if (fields.membershipType) setMembershipType(fields.membershipType);
    if (fields.trainerProgram) setTrainerProgram(fields.trainerProgram);

    if (fields.adults !== undefined) setAdults(fields.adults);
    if (fields.children !== undefined) setChildren(fields.children);
    if (fields.isHostelGuest !== undefined) setIsHostelGuest(fields.isHostelGuest);

    if (fields.room) setKtvRoom(fields.room);
    if (fields.package) setKtvPackage(fields.package);

    if (fields.tableNo) {
      setBilliardsTable(fields.tableNo);
      setTtTable(fields.tableNo);
    }

    if (fields.vehicleType) setVehicleType(fields.vehicleType);
    if (fields.parkingType) setParkingType(fields.parkingType);
    if (fields.isCheckedInGuest !== undefined) setIsCheckedInGuest(fields.isCheckedInGuest);

    if (fields.eventType) setEventType(fields.eventType);
    if (fields.headcount) setHeadcount(fields.headcount);
    if (fields.spaceReserved) setSpaceReserved(fields.spaceReserved);
  };

  const handleSelectPresetChange = (presetId: string) => {
    const found = presets.find((p) => p.id === presetId);
    if (found) applyPreset(found);
  };

  // Effective payment arrangement respects "Pay later" toggle
  const effectiveArrangement: PaymentArrangement =
    paymentTiming === 'pay_later' && paymentArrangement === 'Full Payment'
      ? 'Down Payment'
      : paymentArrangement;

  const totalAmount = Math.max(0, amount - discount);

  const willBePaidImmediately =
    totalAmount === 0 || (paymentChannel === 'Cash' && effectiveArrangement === 'Full Payment' && paymentTiming === 'upfront');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let childData: Record<string, any> = {};
    switch (outlet.slug) {
      case 'pickleball':
        childData = { court, pax, hours, paddleRent, ballRent };
        break;
      case 'hostel':
        childData = { roomType, bookingSource, checkIn, checkOut, numberOfNights };
        break;
      case 'gym':
        childData = { age, membershipStart, membershipType, plan: gymPlan, trainerProgram };
        break;
      case 'pool':
        childData = { adults, children, isHostelGuest, visitDay };
        break;
      case 'ktv':
        childData = { room: ktvRoom, pax: ktvPax, package: ktvPackage };
        break;
      case 'fnb':
        childData = { auditedTo, tableOrRoomNo, orderItems: [] };
        break;
      case 'billiards':
        childData = { tableNo: billiardsTable, hours: billiardsHours };
        break;
      case 'tabletennis':
        childData = { tableNo: ttTable, hours: ttHours };
        break;
      case 'parking':
        childData = { plateNumber: plateNumber || 'UNREGISTERED', vehicleType, parkingType, isCheckedInGuest };
        break;
      case 'events':
        childData = { eventType, eventDate, headcount, spaceReserved };
        break;
      default:
        childData = { notes: 'Standard Outlet Entry' };
        break;
    }

    const createdTx = store.createTransaction({
      outletSlug: outlet.slug,
      outletName: outlet.name,
      outletService: serviceName || 'Standard Service',
      customerName: outlet.slug === 'parking' ? (plateNumber || customerName || 'Walk-in Vehicle') : (customerName || 'Walk-in Guest'),
      employeeHandler: user.name,
      employeeId: user.id,
      transactionAmount: amount,
      discount,
      paymentArrangement: effectiveArrangement,
      paymentChannel,
      childTableData: childData,
    });

    onSuccess(createdTx.transactionID, paymentChannel);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Page Title Row (PDF Column 2 style) */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#1A1A1A]">
            Create transaction
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {OUTLET_FORM_SUBTITLES[outlet.slug] || `New ${outlet.name} transaction`}
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-xs font-semibold text-[#1A1A1A] hover:bg-gray-50 transition-colors cursor-pointer min-h-[40px]"
        >
          Cancel
        </button>
      </div>

      {/* 2-Column Split Form + Summary */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Card: Transaction details */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-gray-200/90 space-y-5">
          <h2 className="text-sm font-bold text-[#1A1A1A]">Transaction details</h2>

          {/* Preset Service Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Preset service
            </label>
            <div className="relative">
              <select
                value={selectedServiceId}
                onChange={(e) => handleSelectPresetChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium text-[#1A1A1A] bg-white appearance-none pr-9 focus:border-[#1A1A1A] outline-none cursor-pointer"
              >
                {presets.length === 0 ? (
                  <option value="">Custom service</option>
                ) : (
                  presets.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (₱{p.defaultPrice.toLocaleString()})
                    </option>
                  ))
                )}
              </select>
              <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* F&B Audit Destination Segmented Control (FR51) */}
          {outlet.slug === 'fnb' && (
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Audit to</label>
              <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-1">
                {(['Walk-in Client', 'Function Guest', 'KTV Room User'] as const).map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setAuditedTo(opt)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      auditedTo === opt ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600 hover:text-[#1A1A1A]'
                    }`}
                  >
                    {opt === 'Walk-in Client' ? 'Walk in' : opt === 'Function Guest' ? 'Function guest' : 'KTV room'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Customer / Plate + Primary Outlet Attribute */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {outlet.slug === 'parking' ? (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Plate number *</label>
                <input
                  type="text"
                  value={plateNumber}
                  onChange={(e) => setPlateNumber(e.target.value.toUpperCase())}
                  placeholder="ABC 1234"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-mono text-[#1A1A1A] uppercase outline-none focus:border-[#1A1A1A]"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Customer name *</label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Maria Santos"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] outline-none focus:border-[#1A1A1A]"
                  required
                />
              </div>
            )}

            {/* Outlet-Specific Secondary Field */}
            {outlet.slug === 'pickleball' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Court</label>
                <select
                  value={court}
                  onChange={(e: any) => setCourt(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] bg-white outline-none"
                >
                  <option value="Al Fresco (Ground Floor)">Al fresco · Ground floor</option>
                  <option value="Indoor (2nd Floor)">Indoor · 2nd floor</option>
                </select>
              </div>
            )}

            {outlet.slug === 'hostel' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Room type</label>
                <select
                  value={roomType}
                  onChange={(e: any) => setRoomType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] bg-white outline-none"
                >
                  <option value="Small Room">Small room</option>
                  <option value="Suite Room">Suite room</option>
                </select>
              </div>
            )}

            {outlet.slug === 'gym' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Age</label>
                <input
                  type="number"
                  min="12"
                  max="90"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] tabular-nums outline-none"
                />
              </div>
            )}

            {outlet.slug === 'pool' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Guest type</label>
                <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHostelGuest(false);
                      setAmount(adults * 300 + children * 150);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      !isHostelGuest ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                    }`}
                  >
                    Walk in
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsHostelGuest(true);
                      setAmount(0);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      isHostelGuest ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                    }`}
                  >
                    Hostel guest
                  </button>
                </div>
              </div>
            )}

            {outlet.slug === 'ktv' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Room</label>
                <select
                  value={ktvRoom}
                  onChange={(e: any) => {
                    setKtvRoom(e.target.value);
                    if (e.target.value.includes('Large')) {
                      setAmount(15000);
                      setKtvPackage('Consumable ₱15,000 Food & Drink');
                    } else {
                      setAmount(5000);
                      setKtvPackage('Consumable ₱5,000 Food & Drink');
                    }
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] bg-white outline-none"
                >
                  <option value="Small Room A (up to 10 pax)">Small room A</option>
                  <option value="Small Room B (up to 10 pax)">Small room B</option>
                  <option value="Large Room (20 to 25+ pax)">Large room</option>
                </select>
              </div>
            )}

            {outlet.slug === 'fnb' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Table or room</label>
                <input
                  type="text"
                  value={tableOrRoomNo}
                  onChange={(e) => setTableOrRoomNo(e.target.value)}
                  placeholder="Table 4"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] outline-none"
                />
              </div>
            )}

            {outlet.slug === 'billiards' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Table</label>
                <select
                  value={billiardsTable}
                  onChange={(e: any) => setBilliardsTable(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] bg-white outline-none"
                >
                  <option value="Table 1">Table 1</option>
                  <option value="Table 2">Table 2</option>
                </select>
              </div>
            )}

            {outlet.slug === 'tabletennis' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Table</label>
                <select
                  value={ttTable}
                  onChange={(e: any) => setTtTable(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] bg-white outline-none"
                >
                  <option value="Table 1">Table 1</option>
                  <option value="Table 2">Table 2</option>
                  <option value="Table 3">Table 3</option>
                </select>
              </div>
            )}

            {outlet.slug === 'parking' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Vehicle type</label>
                <select
                  value={vehicleType}
                  onChange={(e: any) => {
                    setVehicleType(e.target.value);
                    if (isCheckedInGuest) setAmount(0);
                    else if (e.target.value === 'Motorcycle') setAmount(30);
                    else setAmount(40);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] bg-white outline-none"
                >
                  <option value="Car / SUV">Car</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Van">Van</option>
                  <option value="Bicycle / Free">Bicycle</option>
                </select>
              </div>
            )}

            {outlet.slug === 'events' && (
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Event type</label>
                <select
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs text-[#1A1A1A] bg-white outline-none"
                >
                  <option value="Corporate Event">Corporate event</option>
                  <option value="Pre-Christmas Party">Pre-Christmas party</option>
                  <option value="Concert">Concert</option>
                  <option value="TV Show Location">TV show location</option>
                  <option value="Indie Film Shoot">Indie film shoot</option>
                  <option value="Commercial Shoot">Commercial shoot</option>
                </select>
              </div>
            )}
          </div>

          {/* Outlet-Specific Row 2 & 3 */}
          {outlet.slug === 'pickleball' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pax</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={pax}
                  onChange={(e) => setPax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Hours</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Paddle rent (qty)</label>
                <input
                  type="number"
                  min="0"
                  value={paddleRent}
                  onChange={(e) => setPaddleRent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Ball rent (qty)</label>
                <input
                  type="number"
                  min="0"
                  value={ballRent}
                  onChange={(e) => setBallRent(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                />
              </div>
            </div>
          )}

          {outlet.slug === 'hostel' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Booking source</label>
                <select
                  value={bookingSource}
                  onChange={(e: any) => setBookingSource(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                >
                  <option value="Walk-in">Walk in</option>
                  <option value="Agoda">Agoda</option>
                  <option value="Traveloka">Traveloka</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Check in</label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Check out</label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
            </div>
          )}

          {outlet.slug === 'gym' && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Membership start</label>
                <input
                  type="date"
                  value={membershipStart}
                  onChange={(e) => setMembershipStart(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Membership type</label>
                <select
                  value={membershipType}
                  onChange={(e) => setMembershipType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                >
                  <option value="Member">Member</option>
                  <option value="Non-member">Non-member</option>
                  <option value="Self Training">Self training</option>
                  <option value="Student">Student</option>
                  <option value="Regular Routine Muay Thai">Regular routine Muay Thai</option>
                  <option value="Other">Others</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Plan / Arrangement</label>
                <select
                  value={gymPlan}
                  onChange={(e) => setGymPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white"
                >
                  <option value="Monthly">Monthly fee</option>
                  <option value="Walk-in">Walk-in rate</option>
                  <option value="Student Discount">Student discount</option>
                  <option value="1-Month Unlimited">1-month unlimited</option>
                  <option value="12-to-15-Day Bundle">12-to-15-day session bundle</option>
                  <option value="Free First Trial">Free first trial</option>
                </select>
              </div>
            </div>
          )}

          {outlet.slug === 'pool' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Adults (₱300 each)</label>
                <input
                  type="number"
                  min="0"
                  value={adults}
                  onChange={(e) => {
                    const a = Number(e.target.value);
                    setAdults(a);
                    if (!isHostelGuest) setAmount(a * 300 + children * 150);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Children (₱150 each)</label>
                <input
                  type="number"
                  min="0"
                  value={children}
                  onChange={(e) => {
                    const c = Number(e.target.value);
                    setChildren(c);
                    if (!isHostelGuest) setAmount(adults * 300 + c * 150);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                />
              </div>
            </div>
          )}

          {outlet.slug === 'ktv' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Pax</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={ktvPax}
                  onChange={(e) => setKtvPax(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Package</label>
                <input
                  type="text"
                  value={ktvPackage}
                  onChange={(e) => setKtvPackage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
            </div>
          )}

          {(outlet.slug === 'billiards' || outlet.slug === 'tabletennis') && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Hours</label>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={outlet.slug === 'billiards' ? billiardsHours : ttHours}
                  onChange={(e) => {
                    const h = Number(e.target.value);
                    if (outlet.slug === 'billiards') {
                      setBilliardsHours(h);
                      setAmount(h * 200);
                    } else {
                      setTtHours(h);
                      setAmount(h * 150);
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                />
              </div>
            </div>
          )}

          {outlet.slug === 'parking' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Parking type</label>
                <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                  {(['Day', 'Night', 'Overnight'] as const).map((pt) => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setParkingType(pt)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                        parkingType === pt ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                      }`}
                    >
                      {pt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Guest</label>
                <div className="flex p-1 bg-gray-100 rounded-xl gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckedInGuest(false);
                      setAmount(vehicleType === 'Motorcycle' ? 30 : 40);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      !isCheckedInGuest ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                    }`}
                  >
                    Outsider
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckedInGuest(true);
                      setAmount(0);
                    }}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                      isCheckedInGuest ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                    }`}
                  >
                    Checked in (free)
                  </button>
                </div>
              </div>
            </div>
          )}

          {outlet.slug === 'events' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Event date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Headcount</label>
                <input
                  type="number"
                  min="1"
                  value={headcount}
                  onChange={(e) => setHeadcount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs tabular-nums"
                />
              </div>
            </div>
          )}

          {/* Payment Arrangement Segmented Control */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Payment arrangement
            </label>
            <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-1">
              {(['Full Payment', 'Down Payment', 'Contract Payment'] as const).map((arr) => (
                <button
                  key={arr}
                  type="button"
                  onClick={() => setPaymentArrangement(arr)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    paymentArrangement === arr ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600 hover:text-[#1A1A1A]'
                  }`}
                >
                  {arr === 'Full Payment' ? 'Full payment' : arr === 'Down Payment' ? 'Down payment' : 'Contract'}
                </button>
              ))}
            </div>
          </div>

          {/* Mode of payment & Payment timing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Payment channel
              </label>
              <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPaymentChannel('QRPh')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    paymentChannel === 'QRPh' ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  QR Ph
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentChannel('Cash')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    paymentChannel === 'Cash' ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  Cash
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Payment timing
              </label>
              <div className="inline-flex p-1 bg-gray-100 rounded-xl gap-1 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPaymentTiming('upfront')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    paymentTiming === 'upfront' ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  Upfront
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentTiming('pay_later')}
                  className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg text-xs font-semibold cursor-pointer ${
                    paymentTiming === 'pay_later' ? 'bg-white text-[#1A1A1A] shadow-2xs' : 'text-gray-600'
                  }`}
                >
                  Pay later
                </button>
              </div>
            </div>
          </div>

          {/* Date & Time (auto) + Service Price + Discount */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Date & time (auto)
              </label>
              <input
                type="text"
                value={autoDateTime}
                readOnly
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-600 cursor-default"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Amount (₱)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-[#1A1A1A] tabular-nums outline-none focus:border-[#1A1A1A]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Discount (₱)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-medium text-[#1A1A1A] tabular-nums outline-none focus:border-[#1A1A1A]"
              />
            </div>
          </div>
        </div>

        {/* Right Card: Summary (PDF Summary Box) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 border border-gray-200/90 space-y-4">
          <h2 className="text-sm font-bold text-[#1A1A1A]">Summary</h2>

          <div className="space-y-2.5 text-xs pt-1 border-b border-gray-100 pb-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-gray-600">{serviceName || outlet.name}</span>
              <span className="font-semibold text-[#1A1A1A] tabular-nums shrink-0">
                ₱{amount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Discount</span>
              <span className="font-semibold text-[#1A1A1A] tabular-nums">
                ₱{discount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Handler</span>
              <span className="font-medium text-gray-800 truncate max-w-[140px]">{user.name.split(' (')[0]}</span>
            </div>
          </div>

          {/* Highlighted #FFE27A Total Box matching PDF */}
          <div className="rounded-2xl p-4 bg-[#FFE27A] text-[#1A1A1A]">
            <div className="text-xs font-semibold text-[#1A1A1A]/75">Total</div>
            <div className="text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums mt-0.5">
              ₱{totalAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-semibold text-[#1A1A1A]/75 mt-1">
              {willBePaidImmediately ? 'Marked Paid on save' : 'Marked Pending until paid'}
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-[#FF5252] hover:bg-[#ff3b3b] text-[#1A1A1A] font-bold text-xs transition-colors cursor-pointer min-h-[44px]"
          >
            Save transaction
          </button>

          <p className="text-[11px] text-gray-500 leading-relaxed text-center">
            QR Ph code is generated after saving. Cash payments wait for admin confirmation.
          </p>
        </div>
      </form>
    </div>
  );
};
