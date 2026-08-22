import { useState } from "react";
import MemberHeader from "./MemberHeader";
import MemberMenu from "./MemberMenu";

const MemberLayout = ({ children, memberName = "Member" }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">

      {/* MEMBER MENU */}
      <MemberMenu
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        memberName={memberName}
      />

      {/* MAIN AREA */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* MEMBER HEADER */}
        <MemberHeader
          onMenuClick={() => setMenuOpen(true)}
          memberName={memberName}
        />

        {/* PAGE CONTENT */}
        <main
          className="
            min-w-0
            flex-1
            overflow-auto
            bg-slate-100
            p-4
            transition-colors
            dark:bg-slate-950
            sm:p-5
            md:p-6
          "
        >
          {children}
        </main>

      </div>

    </div>
  );
};

export default MemberLayout;