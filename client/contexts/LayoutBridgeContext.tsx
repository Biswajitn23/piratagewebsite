import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

type LayoutBridgeContextValue = {
  openJoinDialog: () => void;
  closeJoinDialog: () => void;
  joinDialogOpen: boolean;
  openAccessibilityPanel: () => void;
  closeAccessibilityPanel: () => void;
  accessibilityPanelOpen: boolean;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
};

const LayoutBridgeContext = createContext<LayoutBridgeContextValue | undefined>(
  undefined,
);

export const LayoutBridgeProvider = ({
  children,
}: {
  children: (value: LayoutBridgeContextValue) => ReactNode;
}) => {
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);
  const [accessibilityPanelOpen, setAccessibilityPanelOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const openJoinDialog = useCallback(() => setJoinDialogOpen(true), []);
  const closeJoinDialog = useCallback(() => setJoinDialogOpen(false), []);

  const openAccessibilityPanel = useCallback(
    () => {
      // Close mobile nav when opening accessibility panel on mobile
      if (window.innerWidth < 1024) {
        setMobileNavOpen(false);
      }
      setAccessibilityPanelOpen(true);
    },
    [],
  );
  const closeAccessibilityPanel = useCallback(
    () => setAccessibilityPanelOpen(false),
    [],
  );

  const value: LayoutBridgeContextValue = {
    openJoinDialog,
    closeJoinDialog,
    joinDialogOpen,
    openAccessibilityPanel,
    closeAccessibilityPanel,
    accessibilityPanelOpen,
    mobileNavOpen,
    setMobileNavOpen,
  };

  return (
    <LayoutBridgeContext.Provider value={value}>
      {children(value)}
    </LayoutBridgeContext.Provider>
  );
};

export const useLayoutBridge = () => {
  const context = useContext(LayoutBridgeContext);

  if (!context) {
    throw new Error("useLayoutBridge must be used within LayoutBridgeProvider");
  }

  return context;
};
