// src/pages/TripsPage.js
import React from 'react';
import PlanPage from '../components/PlanPage';
import { tripAPI } from '../utils/api';

export default function TripsPage() {
  return (
    <PlanPage
      type="trips"
      icon="✈️"
      apiCall={tripAPI}
      config={{
        icon: '✈️',
        hasDestination: true,
        hasDateRange: true,
        statuses: ['planned', 'ongoing', 'completed', 'cancelled'],
        progressFieldKey: 'savedAmount',
        progressField: 'savedAmount'
      }}
    />
  );
}
