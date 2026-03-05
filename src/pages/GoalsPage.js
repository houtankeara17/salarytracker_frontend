// src/pages/GoalsPage.js
import React from 'react';
import PlanPage from '../components/PlanPage';
import { goalAPI } from '../utils/api';

export default function GoalsPage() {
  return (
    <PlanPage
      type="goals"
      icon="🎯"
      apiCall={goalAPI}
      config={{
        icon: '🎯',
        hasDescription: true,
        hasTargetDate: true,
        statuses: ['planned', 'ongoing', 'completed', 'cancelled'],
        progressFieldKey: 'savedAmount',
        progressField: 'savedAmount'
      }}
    />
  );
}
