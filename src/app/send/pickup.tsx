import { router } from "expo-router";
import { StopForm } from "@/components/send";

/** Frame 96 / 99 — Pickup location + sender (1 of 7). */
export default function PickupScreen() {
  return <StopForm kind="pickup" onContinue={() => router.push("/send/dropoff")} />;
}
