import { NextRequest, NextResponse } from 'next/server';
import { generateMockTxHash } from '@/lib/blockchain';
import { ethers } from 'ethers';
import abi from '@/lib/abi.json';

const ledger: Record<string, any>[] = [];

const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com';
const registryAddress = process.env.BIMA_OS_REGISTRY_ADDRESS;
const privateKey = process.env.OPERATOR_PRIVATE_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { entityType, entityId, payload } = body;

    if (!entityType || !entityId) {
      return NextResponse.json(
        { error: 'Missing required fields: entityType, entityId' },
        { status: 400 }
      );
    }

    let txHash = '';
    let blockNumber = null;
    let networkName = 'simulation';
    let realEthTx = false;

    // Check if Ethereum variables are configured
    if (
      privateKey && 
      !privateKey.startsWith('placeholder') && 
      registryAddress && 
      !registryAddress.startsWith('placeholder')
    ) {
      try {
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(privateKey, provider);
        const contract = new ethers.Contract(registryAddress, abi, wallet);

        // Convert string ID to bytes32 hash
        const bytes32Id = ethers.keccak256(ethers.toUtf8Bytes(entityId));
        const userAddress = payload.userAddress || wallet.address;

        let tx;
        if (entityType === 'policy_issuance') {
          // Convert KES premium and coverage to simulated ETH values
          const premiumVal = ethers.parseEther(((payload.premium || 20) / 300000).toFixed(6));
          const coverageVal = ethers.parseEther(((payload.coverage || 50000) / 300000).toFixed(6));
          const policyType = payload.product || 'Standard Cover';

          tx = await contract.registerPolicy(bytes32Id, userAddress, premiumVal, coverageVal, policyType);
        } else if (entityType === 'claim_payout') {
          const policyIdBytes32 = ethers.keccak256(ethers.toUtf8Bytes(payload.policyId || ''));
          const payoutVal = ethers.parseEther(((payload.payoutAmount || 15000) / 300000).toFixed(6));
          const status = payload.status || 'approved';

          tx = await contract.registerClaimPayout(bytes32Id, policyIdBytes32, userAddress, payoutVal, status);
        }

        if (tx) {
          console.log(`[Ethereum Tx Sent] Hash: ${tx.hash}`);
          const receipt = await tx.wait();
          txHash = tx.hash;
          blockNumber = receipt?.blockNumber || null;
          networkName = 'ethereum_sepolia';
          realEthTx = true;
        }
      } catch (ethError) {
        console.error('[Ethereum Tx Error] Falling back to simulation:', ethError);
      }
    }

    // Fallback to simulation if not committed on Ethereum
    if (!realEthTx) {
      txHash = generateMockTxHash();
      blockNumber = Math.floor(Math.random() * 1000000) + 10000000;
      networkName = 'simulation_ledger';
    }

    const entry = {
      id: `${entityType}_${entityId}_${Date.now()}`,
      entityType,
      entityId,
      txHash,
      network: networkName,
      blockNumber,
      payload: payload || {},
      timestamp: new Date().toISOString(),
    };

    ledger.push(entry);

    return NextResponse.json({
      success: true,
      txHash,
      network: networkName,
      blockNumber,
      message: realEthTx 
        ? 'Transaction settled on Ethereum Sepolia Testnet.' 
        : 'Transaction committed to simulation ledger.',
    });
  } catch (error) {
    console.error('[Ledger POST Error]:', error);
    return NextResponse.json(
      { success: false, txHash: `sim_${Date.now().toString(36)}`, network: 'simulation', blockNumber: null },
      { status: 200 }
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const claimId = searchParams.get('claimId');

  if (claimId) {
    const relatedEntries = ledger.filter(
      (e) => {
        const payload = e.payload as Record<string, any> | undefined;
        return payload?.claimId === claimId || e.entityId === claimId;
      }
    );

    const duplicateFound = relatedEntries.filter(
      (e) => e.entityType === 'claim_payout'
    ).length > 1;

    return NextResponse.json({
      verified: !duplicateFound,
      duplicateFound,
      existingClaims: relatedEntries.map((e) => e.entityId),
      entries: relatedEntries,
    });
  }

  return NextResponse.json({
    name: 'BimaOS Blockchain Registry',
    network: registryAddress && !registryAddress.startsWith('placeholder') ? 'Ethereum Sepolia' : 'Stellar Soroban (Simulation)',
    status: 'operational',
    contractAddress: registryAddress || 'Not Deployed',
    totalTransactions: ledger.length,
    recentEntries: ledger.slice(-10),
  });
}
