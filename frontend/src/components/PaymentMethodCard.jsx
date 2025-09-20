import React from "react";

const PaymentMethodCard = ({ method, selectedMethod, onSelect }) => {
  const isSelected = selectedMethod === method.id;

  return (
    <button
      type="button"
      onClick={() => onSelect(method.id)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(method.id); } }}
      className={`w-full flex items-center justify-between gap-4 p-5 rounded-xl border transition text-left focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
        isSelected
          ? 'bg-yellow-50 border-yellow-400 ring-2 ring-yellow-300'
          : 'bg-white hover:bg-gray-50 border-gray-200'
      }`}
      aria-checked={isSelected}
      role="radio"
    >
      <div className="flex items-center gap-4">
        <span
          className={`relative inline-flex items-center justify-center w-5 h-5 rounded-full border transition ${
            isSelected ? 'border-yellow-500 ring-2 ring-yellow-300 bg-yellow-400' : 'border-gray-300 bg-white'
          }`}
          aria-checked={isSelected}
          role="radio"
        >
          {isSelected && (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="white" className="w-3.5 h-3.5">
              <path fillRule="evenodd" d="M16.704 5.29a1 1 0 010 1.414l-7.25 7.25a1 1 0 01-1.414 0l-3.25-3.25a1 1 0 111.414-1.414l2.543 2.543 6.543-6.543a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </span>
        <div>
          <div className="text-base md:text-lg font-semibold text-gray-800">{method.name}</div>
          {method.supports && (
            <div className="mt-1 flex flex-wrap gap-1">
              {method.supports.map((s) => (
                <span key={s} className="text-sm md:text-base px-2 py-0.5 bg-gray-100 text-gray-800 rounded border border-gray-200 font-medium">{s}</span>
              ))}
            </div>
          )}
        </div>
      </div>
      <img src={method.image} alt={method.name} className="h-16 sm:h-20 object-contain" />
    </button>
  );
};

export default PaymentMethodCard;
