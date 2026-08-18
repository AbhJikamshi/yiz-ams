import { createContext, useContext, useEffect, useState } from "react";

const MemberAuthContext = createContext();

export const MemberAuthProvider = ({ children }) => {
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedMember = localStorage.getItem("member");

      if (storedMember) {
        setMember(JSON.parse(storedMember));
      }
    } catch (error) {
      console.error("Member session restore error:", error);

      localStorage.removeItem("member");
      localStorage.removeItem("memberToken");
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (memberData, token) => {
    localStorage.setItem("memberToken", token);
    localStorage.setItem("member", JSON.stringify(memberData));

    setMember(memberData);
  };

  const logout = () => {
    localStorage.removeItem("memberToken");
    localStorage.removeItem("member");

    setMember(null);
  };

  return (
    <MemberAuthContext.Provider
      value={{
        member,
        login,
        logout,
        loading,
        isAuthenticated: !!member,
      }}
    >
      {children}
    </MemberAuthContext.Provider>
  );
};

export const useMemberAuth = () => {
  return useContext(MemberAuthContext);
};