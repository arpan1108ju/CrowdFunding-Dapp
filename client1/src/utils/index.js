export const daysLeft = (deadline) => {
  let difference = new Date(deadline).getTime() - Date.now();
  if(difference <= 0) difference = -difference;
  const remainingDays = difference / (1000 * 3600 * 24);

  return remainingDays.toFixed(0);
};

export const timeDifference = (deadline) => {
   return new Date(deadline).getTime() - Date.now();
}

export const calculateBarPercentage = (goal, raisedAmount) => {
  const percentage = Math.round((raisedAmount * 100) / goal);

  return percentage;
};

export const checkIfImage = (url, callback) => {
  const img = new Image();
  img.src = url;

  if (img.complete) callback(true);

  img.onload = () => callback(true);
  img.onerror = () => callback(false);
};

export const isEqual = (first,second) => {
   return first && second && first.toLowerCase() === second.toLowerCase();
}

export const convertTimeToMs = (timeInput) => {
  const regex = /^(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/;

  const match = timeInput.match(regex);
  if (match) {
      const [_, hours, minutes, seconds, milliseconds] = match.map(Number);

      const totalMilliseconds = (hours * 3600 + minutes * 60 + seconds) * 1000 + milliseconds;
      console.log(`Time in milliseconds: ${totalMilliseconds}`);
      return totalMilliseconds;
  } 
  return 0;
}

export const EVENTS = {
   CAMPAIGN_CREATED : "CampaignCreated",
   DONATION_RECEIVED : "DonationReceived",
   CAMPAIGN_AMOUNT_UPDATED : "CampaignAmountUpdated",
   FUNDS_WITHDRAWN : "FundsWithdrawn",
   CAMPAIGN_CANCELED : "CampaignCanceled",
   DONATION_REFUNDED : "DonationRefunded"
}

export const reverseSortByPId = (array) => {
  return array.sort((a, b) => b.pId - a.pId);
};

export const reverseSortByTimestamp = (array) => {
  return array.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
};

export const isAmountEqual = (first,second) => {
  return first && second && first.toLowerCase() === second.toLowerCase();
}

export const getLocalTimeOffset = () => {
  const now = new Date();
  const offsetInMinutes = now.getTimezoneOffset(); // Difference from UTC in minutes
  
  const sign = offsetInMinutes > 0 ? " + " : " - "; // Determine whether it's ahead or behind UTC
  const absOffset = Math.abs(offsetInMinutes); // Get the absolute value of the offset
  const hours = String(Math.floor(absOffset / 60)).padStart(2, "0"); // Convert minutes to hours
  const minutes = String(absOffset % 60).padStart(2, "0"); // Get remaining minutes
  
  return `${sign}${hours}:${minutes}:00`; // Return in the format +/- HH:MM:00
}

export const getFormattedTime = (remainingTime) => {
  const remainingMilliseconds = remainingTime;

  // Calculate total time in days, hours, minutes, and seconds
  const days = Math.floor(remainingMilliseconds / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remainingMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remainingMilliseconds % (1000 * 60)) / 1000);

  // Convert days to months and years
  const years = Math.floor(days / 365);
  const months = Math.floor((days % 365) / 30);
  const remainingDays = days % 30;

  // Format the time parts with leading zeroes if needed
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSeconds = seconds.toString().padStart(2, '0');

  // Build the formatted string
  let formattedTime = "";
  
  if (years > 0) {
    formattedTime += `${years} years `;
  }
  if (months > 0) {
    formattedTime += `${months} months `;
  }
  if (remainingDays > 0) {
    formattedTime += `${remainingDays} days `;
  }
  
  formattedTime += `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;

  return formattedTime;
};
