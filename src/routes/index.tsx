import { createFileRoute } from "@tanstack/react-router";
import App from "@/tamanna/App";
import "@/tamanna/tamanna.css";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "TAMANNA MOTORS — POS & Inventory" },
      {
        name: "description",
        content:
          "TAMANNA MOTORS Point of Sale (POS) and Excavator, Heavy Machinery & Automotive Spare Parts Inventory Management System — Hazigonj, Chandpur.",
      },
      { property: "og:title", content: "TAMANNA MOTORS — POS & Inventory" },
      {
        property: "og:description",
        content:
          "Point of Sale and spare parts inventory management system for TAMANNA MOTORS, Hazigonj, Chandpur.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  return <App />;
}
