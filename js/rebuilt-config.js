/* Rebuilt offer: custom survey -> Patrick's OWN GHL inbound webhook + Cal.com booking.
   This is the ONLY place the lead destination lives. Everything here points at
   Patrick's account (location yesAsOL6imL8O7yZL8AJ), not any third party. */
(function () {
  'use strict';
  window.REBUILT_CONFIG = Object.freeze({
    /* Leads POST here. Inbound webhook in Patrick's own GHL. */
    webhookUrl: "https://services.leadconnectorhq.com/hooks/yesAsOL6imL8O7yZL8AJ/webhook-trigger/4f98fa9f-0bc8-4d52-8409-af7648b3af48",
    /* Cal.com booking link (synced to patrick@bluecollarmediagroup.com Google calendar). */
    calLink: "blue-collar-media-group/rebuilt-consultation-call",
    calOrigin: "https://cal.com",
    brandColor: "#ffb524",
    /* Offer facts, shown in the payload so GHL has them on every lead. */
    offerName: "Rebuilt",
    offerPrice: 2500,
    offerRegularPrice: 5000,
    offerDeadline: "2026-11-30",
    offerSpots: 5,
    leadSource: "Rebuilt Offer Page",
    liveSubmissionsEnabled: true,
    requestTimeoutMs: 20000
  });
}());
