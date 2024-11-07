import React, { useState } from 'react';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useContractWrite, useContractRead } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { Settings, Loader2, HelpCircle } from 'lucide-react';
import { SlippageSettings } from './SlippageSettings';
import { ConfirmBurnModal } from './ConfirmBurnModal';
import { useTokenPrice } from '../hooks/useTokenPrice';
import { Toast } from './Toast';
import { formatTokenAmount, calculateUSDValue } from '../lib/price';

const KITA_CONTRACT = '0x546638046Ca366375Ec2610ef48F5286b303306c';

const predefinedAmounts = [
  { label: '5B', value: '5000000000' },
  { label: '50B', value: '50000000000' },
  { label: '100B', value: '100000000000' },
  { label: '250B', value: '250000000000' },
  { label: '500B', value: '500000000000' },
  { label: '1T', value: '1000000000000' },
  { label: '5T', value: '5000000000000' },
  { label: '10T', value: '10000000000000' },
];

const abi = [
  {
    "inputs": [{ "internalType": "uint256", "name": "amount", "type": "uint256" }],
    "name": "burn",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
];

export const BurnPortal = () => {
  const [amount, setAmount] = useState('0');
  const [slippage, setSlippage] = useState('Auto');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const tokenPrice = useTokenPrice();

  const { data: balance = 0n } = useContractRead({
    address: KITA_CONTRACT,
    abi,
    functionName: 'balanceOf',
    args: [address ?? '0x'],
    enabled: !!address,
    watch: true,
  });

  const { writeAsync: burnTokens, isPending } = useContractWrite({
    address: KITA_CONTRACT,
    abi,
    functionName: 'burn',
  });

  const formattedBalance = isConnected ? formatTokenAmount(balance) : '0';
  const balanceUSD = isConnected ? calculateUSDValue(balance, tokenPrice) : '$0.00';
  const burnAmountUSD = amount !== '0' 
    ? calculateUSDValue(parseUnits(amount, 9), tokenPrice)
    : '$0.00';

  const handleSetMax = () => {
    setAmount(formatUnits(balance, 9));
  };

  const handleBurn = async () => {
    if (!amount || !isConnected) return;
    
    try {
      const burnAmount = parseUnits(amount, 9);
      if (burnAmount > balance) {
        setToast({ type: 'error', message: 'Amount exceeds balance' });
        return;
      }
      
      const tx = await burnTokens({ args: [burnAmount] });
      setToast({ type: 'success', message: 'Tokens burned successfully!' });
      setAmount('0');
      setIsConfirmOpen(false);
    } catch (error) {
      console.error('Error burning tokens:', error);
      setToast({ type: 'error', message: 'Failed to burn tokens. Please try again.' });
    }
  };

  return (
    <div className="bg-[#1a2332] rounded-xl p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold">Burn</h2>
          <div className="relative">
            <HelpCircle 
              className="w-5 h-5 text-gray-400 cursor-help"
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            />
            {showTooltip && (
              <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#2d3748] text-sm p-3 rounded-lg shadow-lg w-64 z-10">
                Burning tokens permanently removes them from circulation, reducing the total supply and potentially increasing the value of remaining tokens.
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg bg-[#2d3748] hover:bg-[#3a4a63] transition-colors"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-[#0d1117] p-4 rounded-lg mb-6">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center">
            <span className="text-[#8364ac] font-semibold flex items-center gap-2 text-base mb-2 sm:mb-0">
              <img src="https://kitainu.org/logo.svg" alt="KITA" className="w-6 h-6" />
              Burn KITA
            </span>
            <div className="flex flex-col sm:items-end">
              <div className="flex items-center gap-2 justify-between sm:justify-end">
                <span className="text-gray-400">Balance:</span>
                <span className="text-gray-400 transition-all duration-300">{formattedBalance} KITA</span>
                {isConnected && (
                  <button
                    onClick={handleSetMax}
                    className="px-2 py-1 text-sm bg-[#2d3748] hover:bg-[#3a4a63] rounded transition-colors ml-2"
                  >
                    Max
                  </button>
                )}
              </div>
              <div className="text-sm text-gray-500">{balanceUSD}</div>
            </div>
          </div>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-transparent text-2xl outline-none font-medium mt-2"
            placeholder="0.0"
          />
          {amount !== '0' && (
            <div className="text-sm text-gray-500 mt-1">≈ {burnAmountUSD}</div>
          )}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {predefinedAmounts.map((preset) => (
            <button
              key={preset.value}
              onClick={() => setAmount(preset.value)}
              className={`px-4 py-2 rounded-lg hover:bg-[#3a4a63] transition-colors font-medium ${
                amount === preset.value ? 'bg-[#8364ac]' : 'bg-[#2d3748]'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {isConnected ? (
        <button
          onClick={() => setIsConfirmOpen(true)}
          disabled={isPending || amount === '0'}
          className="w-full py-3 bg-[#8364ac] hover:bg-[#6b4f91] active:bg-[#5a4279] disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Burning...</span>
            </>
          ) : (
            'Burn Tokens'
          )}
        </button>
      ) : (
        <button
          onClick={() => open()}
          className="w-full py-3 bg-[#8364ac] hover:bg-[#6b4f91] active:bg-[#5a4279] rounded-lg font-semibold transition-colors"
        >
          Connect Wallet
        </button>
      )}

      <SlippageSettings
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSlippageChange={setSlippage}
        currentSlippage={slippage}
      />

      <ConfirmBurnModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleBurn}
        amount={amount}
        usdValue={burnAmountUSD}
        isPending={isPending}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};