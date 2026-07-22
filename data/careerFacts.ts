export const careerFacts = {
  redEye: {
    roleStart: "2024-01",
    rolePeriod: "January 2024–present",
    customPlatformLaunch: "2025-10",
    customPlatformLaunchLabel: "October 2025",
    role: "Co-Founder & CTO",
    ownership: "Sole technical contributor",
    metricsAsOf: "2026-07-21",
    metricsAsOfLabel: "July 21, 2026",
    metrics: {
      ticketedEvents: { value: "240+", floor: 240 },
      buyerIdentities: { value: "15K+", floor: 15_000 },
      completedOrders: { value: "19K+", floor: 19_000 },
      ticketsIssued: { value: "29K+", floor: 29_000 },
      grossPaymentVolume: { value: "$900K+", floor: 900_000 },
      producerCount: null,
    },
  },
  theSeason: {
    period: "February 2024–February 2026",
  },
  einstein: {
    period: "May 2023–January 2024",
    role: "Contract Frontend Developer",
  },
  steveMadden: {
    period: "March–August 2021",
    role: "Graphic Design Specialist",
    salesCycle: "Spring/Summer 2022",
  },
} as const;
