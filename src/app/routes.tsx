import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/RootLayout";
import { LandingPage } from "./components/LandingPage";
import { Dashboard } from "./components/Dashboard";
import { HotPlayers } from "./components/HotPlayers";
import { PlayerDetails } from "./components/PlayerDetails";
import { AgingCurves } from "./components/AgingCurves";
import { ScheduleDifficulty } from "./components/ScheduleDifficulty";
import { MiscAnalytics } from "./components/MiscAnalytics";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/app",
    Component: RootLayout,
    children: [
      { index: true, Component: Dashboard },
      { path: "hot-players", Component: HotPlayers },
      { path: "player-details", Component: PlayerDetails },
      { path: "aging-curves", Component: AgingCurves },
      { path: "schedule-difficulty", Component: ScheduleDifficulty },
      { path: "misc-analytics", Component: MiscAnalytics },
    ],
  },
]);
