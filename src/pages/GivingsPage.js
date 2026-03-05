// src/pages/GivingsPage.js
import React from "react";
import PlanPage from "../components/PlanPage";
import { givingAPI } from "../utils/api";

export default function GivingsPage() {
  return (
    <PlanPage
      type="givings"
      icon="🤝"
      apiCall={givingAPI}
      config={{
        icon: "🤝",
        hasRecipient: true,
        hasDate: true,
        statuses: ["planned", "ongoing", "completed"],
        progressFieldKey: "givenAmount",
        progressField: "givenAmount",
      }}
    />
  );
}
