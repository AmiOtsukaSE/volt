import AdminStats from "./components/AdminStats";
import HomeClient from "./components/HomeClient";

export default function Page() {
  return <HomeClient adminStatsSlot={<AdminStats />} />;
}
