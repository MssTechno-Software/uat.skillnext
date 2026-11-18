
import { Outlet } from "react-router-dom";
import Sidebar from "../Sidebar";
import QuickActions from "./QuickActions";

function StudentLayout() {
  return (
    <Sidebar>
      {/* Render the currently selected student page */}
      <Outlet />

      {/* Display the floating Quick Actions on every student page */}
      <QuickActions />
    </Sidebar>
  );
}

export default StudentLayout;
