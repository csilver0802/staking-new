import { useState, useEffect } from 'react';

export function useTokenPrice() {
  const [price, setPrice] = useState<number>(0);

  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const response = await fetch('https://api.dexscreener.com/latest/dex/tokens/0x546638046Ca366375Ec2610ef48F5286b303306c');
        
        if (!response.ok) {
          console.warn('Error fetching price from DexScreener');
          return;
        }

        const data = await response.json();
        const pair = data.pairs?.[0];
        
        if (pair?.priceUsd) {
          setPrice(Number(pair.priceUsd));
        }
      } catch (error) {
        console.warn('Price fetch error:', error);
      }
    };

    fetchPrice();
    const interval = setInterval(fetchPrice, 15000); // Update every 15 seconds

    return () => clearInterval(interval);
  }, []);

  return price;
}