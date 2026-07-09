const path = require('path');
const fs = require('fs');
const solc = require('solc');
const { ethers } = require('ethers');

// Helper to load env
const envPath = path.join(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach((line) => {
    const parts = line.split('=');
    if (parts.length >= 2 && !parts[0].trim().startsWith('#')) {
      const key = parts[0].trim();
      const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

async function main() {
  console.log("Compiling BimaRegistry.sol...");
  const contractPath = path.join(__dirname, '../contracts/BimaRegistry.sol');
  const source = fs.readFileSync(contractPath, 'utf8');

  const input = {
    language: 'Solidity',
    sources: {
      'BimaRegistry.sol': {
        content: source
      }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  
  if (output.errors) {
    for (const err of output.errors) {
      if (err.severity === 'error') {
        console.error("Compilation Error:", err.message);
        process.exit(1);
      }
    }
  }

  const contractOutput = output.contracts['BimaRegistry.sol']['BimaRegistry'];
  const abi = contractOutput.abi;
  const bytecode = contractOutput.evm.bytecode.object;

  console.log("Compilation successful!");

  // Save ABI to lib/abi.json
  const libDir = path.join(__dirname, '../src/lib');
  if (!fs.existsSync(libDir)) {
    fs.mkdirSync(libDir, { recursive: true });
  }
  fs.writeFileSync(
    path.join(libDir, 'abi.json'),
    JSON.stringify(abi, null, 2)
  );

  const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
  const privateKey = process.env.OPERATOR_PRIVATE_KEY;

  if (!privateKey || privateKey.startsWith('placeholder')) {
    console.error("\n❌ Error: Please configure OPERATOR_PRIVATE_KEY in your .env file before deploying!");
    process.exit(1);
  }

  console.log("Connecting to network via RPC:", rpcUrl);
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  
  let wallet;
  try {
    wallet = new ethers.Wallet(privateKey, provider);
  } catch (e) {
    console.error("\n❌ Error: Invalid private key format. Ensure it is a 64-character hex string.");
    process.exit(1);
  }

  console.log("Deploying BimaRegistry from address:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    console.error("\n❌ Error: Account balance is 0. Please fund your address with Sepolia test ETH.");
    process.exit(1);
  }

  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy();
  
  console.log("Waiting for deployment transaction...");
  await contract.waitForDeployment();
  const address = await contract.getAddress();

  console.log("\n=========================================");
  console.log("🎉 BimaRegistry contract deployed successfully!");
  console.log("Contract Address:", address);
  console.log("=========================================");
  console.log("👉 Please update BIMA_OS_REGISTRY_ADDRESS in your .env file with this address!");
}

main().catch((err) => {
  console.error("Deployment failed:", err);
  process.exit(1);
});
