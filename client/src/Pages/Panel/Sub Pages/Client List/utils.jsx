export const getDisplayName = (username, managers) => {
    const manager = managers.find(m => m.username === username);
    return manager ? manager.firstName : username;
  };
  
  export const searchFields = (client, term, managers) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const termLower = term.toLowerCase();
    const lastVisit = client.clientVisits[client.clientVisits.length - 1];
  
    return (
      fullName.includes(termLower) ||
      (client.requirement && client.requirement.toLowerCase().includes(termLower)) ||
      (client.budget && client.budget.toString().toLowerCase().includes(termLower)) ||
      (lastVisit &&
        ((lastVisit.referenceBy && lastVisit.referenceBy.toLowerCase().includes(termLower)) ||
          (lastVisit.sourcingManager && getDisplayName(lastVisit.sourcingManager, managers).toLowerCase().includes(termLower)) ||
          (lastVisit.relationshipManager && getDisplayName(lastVisit.relationshipManager, managers).toLowerCase().includes(termLower)) ||
          (lastVisit.closingManager && getDisplayName(lastVisit.closingManager, managers).toLowerCase().includes(termLower)) ||
          (lastVisit.status && lastVisit.status.toLowerCase().includes(termLower))))
    );
  };
  
  export const formatBudget = (amount) => {
    if (amount >= 10000000) {
      return `${(amount / 10000000).toFixed(3)} Cr`; // Convert to Crore
    } else if (amount >= 100000) {
      return `${(amount / 100000).toFixed(2)} Lac`; // Convert to Lac
    } else {
      return amount.toFixed(); // No conversion needed, ensure two decimal places
    }
  };
  
  export const formatDate = (date) => {
    const options = { day: '2-digit', month: 'short', year: '2-digit' };
    return new Date(date).toLocaleDateString('en-GB', options).replace(/ /g, '-');
  };
  
  export const getStatusClass = (status) => {
    switch (status) {
      case "warm":
        return "status-warm";
      case "cold":
        return "status-cold";
      case "lost":
        return "status-lost";
      case "booked":
        return "status-booked";
      default:
        return "";
    }
  };
  