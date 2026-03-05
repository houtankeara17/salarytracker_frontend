// src/pages/OthersPage.js
import React from 'react';
import PlanPage from '../components/PlanPage';
import { otherAPI } from '../utils/api';

export default function OthersPage() {
  return (
    <PlanPage
      type="others"
      icon="📦"
      apiCall={otherAPI}
      config={{
        icon: '📦',
        hasDescription: true,
        hasDate: true,
        statuses: ['ongoing', 'completed'],
        progressFieldKey: 'paidAmount',
        progressField: 'paidAmount'
      }}
    />
  );
}
