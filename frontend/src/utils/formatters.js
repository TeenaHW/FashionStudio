export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-LK', {
    style: 'currency',
    currency: 'LKR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-LK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

export const getMonthOptions = () => {
  const options = [];
  const currentDate = new Date();
  // Array of month names to ensure correct formatting
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  for (let i = 0; i < 12; i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    
    const year = date.getFullYear();
    const monthName = monthNames[date.getMonth()]; // Get "August" from the array

    options.push({
      // Label is what the user sees: "August 2025"
      label: `${monthName} ${year}`,
      // Value is what is sent to the API: "August-2025"
      value: `${monthName}-${year}`
    });
  }
  
  return options;
};
