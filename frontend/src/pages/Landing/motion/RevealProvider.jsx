import React, {
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

const RevealContext = createContext({
  revealed: true,
  reveal: () => {},
});

export const useReveal = () => useContext(RevealContext);

export function RevealProvider({ children }) {
  const [revealed, setRevealed] = useState(false);
  const value = useMemo(
    () => ({ revealed, reveal: () => setRevealed(true) }),
    [revealed],
  );
  return (
    <RevealContext.Provider value={value}>{children}</RevealContext.Provider>
  );
}
