import React from 'react';
import { formatBudget, formatDate, getStatusClass, getDisplayName } from './utils';
import { Link } from "react-router-dom";

const ClientRow = ({ client, activeClientId, onRowClick, managers }) => {
  const lastVisit = client.clientVisits[client.clientVisits.length - 1];

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
      <td data-cell='Requirement'>{client.requirement}</td>
      <td data-cell='Budget'>{formatBudget(client.budget)}</td>
      {lastVisit && (
        <>
          <td data-cell='Reference'>{lastVisit.referenceBy}</td>
          <td data-cell='Source'>{getDisplayName(lastVisit.sourcingManager, managers)}</td>
          <td data-cell='Relation'>{getDisplayName(lastVisit.relationshipManager, managers)}</td>
          <td data-cell='Closing'>{getDisplayName(lastVisit.closingManager, managers)}</td>
          <td data-cell='Status' className={getStatusClass(lastVisit.status)}>
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
    </tr>
  );
};

export default ClientRow;
