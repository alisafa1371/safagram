import { currentUser } from "@clerk/nextjs/server";
import React from "react";
import AuthenticatedSidebar from "./AuthenticatedSidebar";
import UnauthenticatedSidebar from "./UnauthenticatedSidebar";

async function Sidebar() {
  const authUser = await currentUser();

  if (!authUser) return <UnauthenticatedSidebar />;
  return (
    <div>
      <AuthenticatedSidebar _user={authUser} />
    </div>
  );
}

export default Sidebar;
