import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
    console.log("🚀 Deploying FhenixOGNFT (Simple Version) to Sepolia...");

    // Get the deployer account
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    
    // Check account balance
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH");

    // Deploy the contract
    const FhenixOGNFT = await ethers.getContractFactory("contracts/FhenixOGNFT_Simple.sol:FhenixOGNFT");
    
    // Contract parameters
    const name = "FIXN OG";
    const symbol = "FXOG";
    const baseURI = "ipfs://QmYourIPFSHashHere/";

    console.log("📝 Contract Parameters:");
    console.log("  Name:", name);
    console.log("  Symbol:", symbol);
    console.log("  Base URI:", baseURI);

    const contract = await FhenixOGNFT.deploy(name, symbol, baseURI);
    
    console.log("⏳ Waiting for deployment...");
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    console.log("✅ FhenixOGNFT deployed to:", contractAddress);
    
    // Wait for a few block confirmations
    console.log("⏳ Waiting for block confirmations...");
    const deploymentTx = contract.deploymentTransaction();
    if (deploymentTx) {
        await deploymentTx.wait(3);
    }

    console.log("\n📋 Contract Details:");
    console.log("  Address:", contractAddress);
    console.log("  Name:", await contract.name());
    console.log("  Symbol:", await contract.symbol());
    console.log("  Max Supply:", await contract.MAX_SUPPLY());
    console.log("  Mint Price:", ethers.formatEther(await contract.MINT_PRICE()), "ETH");

    console.log("\n📋 To verify contract on Etherscan, run:");
    console.log(`npx hardhat verify --network eth-sepolia ${contractAddress} "${name}" "${symbol}" "${baseURI}"`);
    
    console.log("\n🎉 Deployment complete!");
    console.log("\nNext steps:");
    console.log("1. Update the contract address in frontend: src/lib/contracts.ts");
    console.log("2. Update frontend ABI to match simple contract");
    console.log("3. Test minting with low gas fees");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
