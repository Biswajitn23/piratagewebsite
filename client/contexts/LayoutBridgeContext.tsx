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

  const openJoinDialog = useCallback(() => setJoinDialogOpen(true), []);
  const closeJoinDialog = useCallback(() => setJoinDialogOpen(false), []);

  const openAccessibilityPanel = useCallback(
    () => setAccessibilityPanelOpen(true),
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
