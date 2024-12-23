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
   CAMPAIGN_CANCELED : "CampaignCanceled"
}

export const reverseSortByPId = (array) => {
  return array.sort((a, b) => b.pId - a.pId);
};
