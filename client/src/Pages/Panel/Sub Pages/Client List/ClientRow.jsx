import React, { useEffect, useState } from 'react';
import { formatBudget, formatDate, getStatusClass, getDisplayName } from './utils';
import { Link } from "react-router-dom";

const ClientRow = ({ client, activeClientId, onRowClick, managers }) => {
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1200px)');

    const handleResize = () => {
      setIsLargeScreen(mediaQuery.matches);
    };

    handleResize();
    mediaQuery.addEventListener('change', handleResize);

    return () => {
      mediaQuery.removeEventListener('change', handleResize);
    };
  }, []);

  const handleConditionalClick = (clientId) => {
    if (isLargeScreen) {
      onRowClick(clientId);
    }
  };

  const lastVisit = client.clientVisits[client.clientVisits.length - 1];
  const lastRemarkID = lastVisit.visitRemarkId[lastVisit.visitRemarkId.length - 1];
  let lastRemark = 'No remark available for this record';
  if (lastRemarkID && lastRemarkID.visitRemark) { lastRemark = lastRemarkID.visitRemark}

  return (
    <tr
      key={client._id}
      className={activeClientId === client._id ? 'active' : ''}
    >
      <td data-cell='Last Visit Date' onClick={() => onRowClick(client._id)}>
        {lastVisit ? formatDate(lastVisit.date) : 'N/A'}
      </td>
      <td data-cell='Name' onClick={() => onRowClick(client._id)}>
        {client.firstName + " " + client.lastName}
      </td>
      <td data-cell='Requirement' onClick={() => handleConditionalClick(client._id)}>
        {client.requirement}
      </td>
      <td data-cell='Budget' onClick={() => handleConditionalClick(client._id)}>
        {formatBudget(client.budget)}
      </td>
      {lastVisit && (
        <>
          <td data-cell='Reference' onClick={() => handleConditionalClick(client._id)}>
            {lastVisit.referenceBy}
          </td>
          <td data-cell='Source' onClick={() => handleConditionalClick(client._id)}>
            {getDisplayName(lastVisit.sourcingManager, managers)}
          </td>
          <td data-cell='Relation' onClick={() => handleConditionalClick(client._id)}>
            {getDisplayName(lastVisit.relationshipManager, managers)}
          </td>
          <td data-cell='Closing' onClick={() => handleConditionalClick(client._id)}>
            {getDisplayName(lastVisit.closingManager, managers)}
          </td>
          <td data-cell='Status' onClick={() => onRowClick(client._id)} className={getStatusClass(lastVisit.status)}>
            {lastVisit.status}
          </td>
        </>
      )}
      <td>
        <Link to={`/panel/client-details/${client._id}`}>
          <button>
            <span className="material-symbols-rounded">chevron_right</span>
          </button>
        </Link>
      </td>
      <td data-cell="Remark">
        {lastRemark}
      </td>
    </tr>
  );
};

export default ClientRow;
