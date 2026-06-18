import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNavBar } from "./TopNavBar";

export function Layout() {
  return (
    <div className="bg-background text-on-background flex h-screen overflow-hidden text-[14px] antialiased">
      <Sidebar />
      <div className="flex-1 ml-[260px] flex flex-col h-screen overflow-hidden">
        <TopNavBar />
        <main className="flex-1 overflow-hidden flex flex-col bg-background">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
