import React from 'react';
import { StakingPortal } from './components/StakingPortal';
import { Navigation } from './components/Navigation';
import { StakingDashboard } from './components/StakingDashboard';
import { ClaimRewards } from './components/ClaimRewards';

function App() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-white flex flex-col">
      <Navigation />

      <main className="flex-1">
        <div className="container mx-auto px-4 lg:px-[50px] py-8 pt-24">
          <div className="mb-8">
            <div className="relative h-[180px] rounded-xl flex items-center justify-center overflow-hidden bg-gradient-to-br from-[#8364ac] to-[#6b4f91]">
              <div className="absolute inset-0">
                <div className="absolute inset-0">
                  <div className="absolute w-[800px] h-[800px] rounded-full bg-[#9575bd] blur-[100px] opacity-30 -top-[400px] -right-[200px]" />
                  <div className="absolute w-[600px] h-[600px] rounded-full bg-[#9575bd] blur-[100px] opacity-30 -bottom-[300px] -left-[100px]" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center perspective-[1000px]">
                  <img
                    src="https://kitainu.org/logo.svg"
                    alt=""
                    className="absolute w-[800px] opacity-[0.08] scale-[1.2] transform 
                      rotate-[-15deg] translate-y-[-15%] translate-x-[5%]
                      hover:rotate-[-10deg] hover:scale-[1.3] hover:translate-y-[-10%]
                      transition-all duration-1000 ease-out"
                    style={{
                      filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.3))',
                      transform: 'rotateX(15deg) rotateY(-15deg)',
                      transformStyle: 'preserve-3d',
                    }}
                  />
                </div>
              </div>
              <h1 className="text-[42px] font-bold text-white relative z-10 drop-shadow-lg">
                Staking Portal
              </h1>
            </div>
          </div>

          <div className="grid gap-6">
            <StakingPortal />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StakingDashboard />
              <ClaimRewards />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
