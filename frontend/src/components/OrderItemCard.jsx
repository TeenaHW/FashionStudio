import React from 'react';

const OrderItemCard = ({ item }) => {
  // Skip items without valid product
  if (!item?.productId) return null;

  // Helpers (reusable within this component)
  const formatRs = (n) => `Rs. ${Number(n || 0).toFixed(2)}`;
  const basePrice = item.price * item.quantity;
  const discountPct = item.productId.discount || 0;
  const discountAmount = (discountPct / 100) * basePrice;
  const finalPrice = basePrice - discountAmount;
  const hasVariants = item.size || item.color;
  const hasDiscount = discountPct > 0;

  // Small reusable UI sub-blocks
  const DiscountBadge = () => (
    hasDiscount ? (
      <span className="ml-2 inline-flex items-center text-[10px] font-bold bg-red-500 text-white px-2 py-0.5 rounded">
        -{discountPct}%
      </span>
    ) : null
  );

  const VariantChips = () => (
    hasVariants ? (
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
        {item.size && (
          <span className="px-2 py-0.5 bg-gray-700 rounded border border-gray-600">Size: {item.size}</span>
        )}
        {item.color && (
          <span className="px-2 py-0.5 bg-gray-700 rounded border border-gray-600">Color: {item.color}</span>
        )}
      </div>
    ) : null
  );

  const PriceBreakdown = () => (
    <div className="text-right">
      <div className="text-sm text-gray-300">{formatRs(item.price)} x {item.quantity}</div>
      {hasDiscount && (
        <div className="text-xs text-green-400">- {formatRs(discountAmount)} (save {discountPct}%)</div>
      )}
      <div className="text-yellow-400 font-bold">{formatRs(finalPrice)}</div>
      {hasDiscount && (
        <div className="text-xs text-gray-500 line-through">{formatRs(basePrice)}</div>
      )}
    </div>
  );

  return (
    <div className="flex justify-between items-start bg-gray-800 p-4 rounded mb-3">
      <div className="flex items-start gap-4">
        <img
          src={item.productId.imageUrl || item.productId.image}
          alt={item.productId.name}
          className="w-16 h-16 object-cover rounded"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = '/placeholder-product.jpg';
          }}
        />
        <div>
          <div className="flex items-center">
            <p className="text-white font-semibold">{item.productId.name}</p>
            <DiscountBadge />
          </div>
          <p className="text-gray-300 text-sm mt-0.5">
            Qty: {item.quantity} | Unit: {formatRs(item.price)}
          </p>
          <VariantChips />
        </div>
      </div>
      <PriceBreakdown />
    </div>
  );
};

export default OrderItemCard;
