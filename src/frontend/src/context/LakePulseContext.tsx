import React, { createContext, useContext, useState, useEffect } from "react";
import { getMyLakes } from "../services/api/lake.service";

import { mylakes } from '../types/api.types';

interface LakePulseContextType {
  lakes: mylakes[];
  setLakes: React.Dispatch<React.SetStateAction<mylakes[]>>;
  userRole: string | null;
  setUserRole: React.Dispatch<React.SetStateAction<string | null>>;
}

const LakePulseContext = createContext<LakePulseContextType | undefined>(undefined);

function getRoleFromLocalStorage(): string | null {
  try {
    const idToken = localStorage.getItem("idToken");
    if (idToken) {
      const parsed = JSON.parse(idToken);
      return parsed?.profile?.role ?? null;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

export const LakePulseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lakes, setLakes] = useState<mylakes[]>([]);
  const [userRole, setUserRole] = useState<string | null>(getRoleFromLocalStorage());

useEffect(() => {
  const idToken = localStorage.getItem("idToken");
  if (!idToken) {
    setLakes([]);
    setUserRole(null);
    return;
  }

  async function fetchLakes() {
    const lakes = await getMyLakes();
    setLakes(lakes);
    setUserRole(getRoleFromLocalStorage());
  }

  fetchLakes();
}, []);

  return (
    <LakePulseContext.Provider value={{ lakes, setLakes, userRole, setUserRole }}>
      {children}
    </LakePulseContext.Provider>
  );
};

export function useLakePulse() {
  const ctx = useContext(LakePulseContext);
  if (!ctx) throw new Error("useLakePulse must be used within a LakePulseProvider");
  return ctx;
}