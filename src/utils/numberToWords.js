/**
 * Converts a number to Indian Rupees format in words.
 * Example: 32851.20 -> "Thirty Two Thousand Eight Hundred Fifty One Rupees and Twenty Paise Only"
 */
export function numberToWords(num) {
  if (num === null || num === undefined || isNaN(num)) return "";
  
  // Round to 2 decimal places to avoid float precision issues
  const value = Math.round(num * 100) / 100;
  
  if (value === 0) return "Zero Rupees Only";
  
  const rupees = Math.floor(value);
  const paise = Math.round((value - rupees) * 100);
  
  const ones = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  
  const tens = [
    "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
  ];
  
  function convertSection(n) {
    let str = "";
    if (n >= 100) {
      str += ones[Math.floor(n / 100)] + " Hundred ";
      n %= 100;
    }
    if (n >= 20) {
      str += tens[Math.floor(n / 10)] + " ";
      n %= 10;
    }
    if (n > 0) {
      str += ones[n] + " ";
    }
    return str.trim();
  }
  
  function convertRupees(n) {
    if (n === 0) return "";
    
    let str = "";
    
    // Crores (1,00,00,000)
    if (n >= 10000000) {
      str += convertRupees(Math.floor(n / 10000000)) + " Crore ";
      n %= 10000000;
    }
    
    // Lakhs (1,00,000)
    if (n >= 100000) {
      str += convertSection(Math.floor(n / 100000)) + " Lakh ";
      n %= 100000;
    }
    
    // Thousands (1,000)
    if (n >= 1000) {
      str += convertSection(Math.floor(n / 1000)) + " Thousand ";
      n %= 1000;
    }
    
    // Remaining (< 1000)
    if (n > 0) {
      str += convertSection(n);
    }
    
    return str.trim();
  }
  
  let result = "";
  if (rupees > 0) {
    result += convertRupees(rupees) + " Rupees";
  } else {
    result += "Zero Rupees";
  }
  
  if (paise > 0) {
    result += " and " + convertSection(paise) + " Paise";
  }
  
  result += " Only";
  
  // Normalize whitespace (multiple spaces to single space)
  return result.replace(/\s+/g, ' ').trim();
}
