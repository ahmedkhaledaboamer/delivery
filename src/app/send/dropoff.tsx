import { router } from "expo-router";
import { StopForm } from "@/components/send";

/** Frame 98 — Drop-off location + receiver. */
export default function DropoffScreen() {
  return <StopForm kind="dropoff" onContinue={() => router.push("/send/confirm-route")} />;
}
