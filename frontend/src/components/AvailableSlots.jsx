export default function AvailableSlots({ bookedSlots = [], selectedSlot, onSelectSlot }) {
  const standardSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00"
  ];

  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-slate-700 mb-3">Available Time Slots</label>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-4">
        {standardSlots.map(slot => {
          const isBooked = bookedSlots.includes(slot);
          const isSelected = selectedSlot === slot;
          
          return (
            <button
              key={slot}
              type="button"
              disabled={isBooked}
              onClick={() => onSelectSlot(slot)}
              className={`
                py-2 px-3 text-sm font-medium rounded-lg border transition-all duration-200
                ${isBooked 
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed hidden sm:block' 
                  : isSelected
                    ? 'bg-brand1 text-white border-brand1 shadow-md scale-[1.02]'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-brand1 hover:text-brand1 hover:bg-teal-50'
                } 
                ${isBooked && 'opacity-50'}
              `}
              title={isBooked ? 'Slot unavailable' : 'Select this slot'}
            >
              {slot}
            </button>
          )
        })}
      </div>
      {bookedSlots.length === standardSlots.length && (
        <p className="mt-3 text-sm text-red-500 font-medium">All slots are booked for this date.</p>
      )}
    </div>
  );
}
