


  
// // A Provider in ethers is a read-only abstraction to access the blockchain data.
// export const getWalletBalanceInETH = async () => {
//     const balanceWei = await provider.getBalance(CROWDFUNDING_CONTRACT_ADDRESS);
//     const balanceEth = formatEther(balanceWei); // Convert Wei to ETH string
//     return balanceEth; // Convert ETH string to number
// };

// // Function to get contract balance in ETH
// export const getContractBalanceInETH = async () => {
//     const balanceWei = await contract.getBalance();
//     const balanceEth = formatEther(balanceWei); // Convert Wei to ETH string
//     return balanceEth; // Convert ETH string to number
//   };

// // Function to deposit funds to the contract
// export const depositFund = async (depositValue) => {
//   const ethValue = parseEther(depositValue);
//   const deposit = await contract.deposit({ value: ethValue });
//   await deposit.wait();
// };

// // Function to withdraw funds from the contract
// export const withdrawFund = async (withdrawValue) => {
//   const ethValue = parseEther(withdrawValue);
//   const withdrawTx = await contract.withdraw(ethValue);
//   await withdrawTx.wait();
//   console.log("Withdrawal successful!");
// };


// // Function to withdraw funds from the contract
// export const withdrawFund = async (withdrawValue) => {
//     const ethValue = parseEther(withdrawValue);
//     const withdrawTx = await contract.withdraw(ethValue);
//     await withdrawTx.wait();
//     console.log("Withdrawal successful!");
//   };
  