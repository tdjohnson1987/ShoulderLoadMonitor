// /BluetoothVMContext.tsx
import React, {
    createContext,
    useContext,
    useMemo,
    useState,
} from "react";
import {
    BluetoothScanViewModel,
    ScanViewState,
} from "../hooksVM/BluetoothVM";

type BluetoothContextValue = {
  viewState: ScanViewState;
  viewModel: BluetoothScanViewModel;
};

const BluetoothContext = createContext<BluetoothContextValue | undefined>(
  undefined
);

export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [viewState, setViewState] = useState<ScanViewState>(
    new BluetoothScanViewModel(() => {}).initialState
  );

  const viewModel = useMemo(
    () => new BluetoothScanViewModel(setViewState),
    []
  );

  return (
    <BluetoothContext.Provider value={{ viewState, viewModel }}>
      {children}
    </BluetoothContext.Provider>
  );
};

export const useBluetoothVM = () => {
  const ctx = useContext(BluetoothContext);
  if (!ctx) {
    throw new Error("useBluetoothVM must be used inside BluetoothProvider");
  }
  return ctx;
};
