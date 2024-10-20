interface EthereumRequestArguments {
    method: string;
    params?: unknown[] | object;
  }
  
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      request: <T>(args: EthereumRequestArguments) => Promise<T>;
    };
  }
  
