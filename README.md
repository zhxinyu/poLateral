<img src="./bridge.jpeg" width="200">

# poLateral

Hack FEVM [link](https://ethglobal.com/showcase/polateral-88ipp)

## Introduction
poLateral is an open-source liquidity protocol to provide Filecoin (FIL) collaterals as a loan for storage providers (SPs). The main object of the protocol is a lending pool in which liquidity providers (LPs) can supply FIL assets (other ERC-20 tokens are allowed via in-contract swap in the future) and storage providers can borrow a designated amount based on pledging and collateral requirements in offering computer storage services. The smart contract backing such a protocol will retain revenues from storage services and distribute them back to SP until the loan is paid off. During staking periods, the smart contract will also dispense interest incomes and repayment to LPs.

## Motivation
As discussed in [here](https://fvm-forum.filecoin.io/t/lending-pool-cookbook/114), to meet the eligibility of providing storage space on-chain in FIL network and receiving storage requests (deals), SPs are stipulated to stake sufficient FIL amounts to validate in-network storage capacity. The introduction of such a mechanism encourages SPs to follow an acceptable and sustainable manner within the assigned guideline and responsibilities such as presenting periodical proof of storage (both [Proof-of-Replication](https://filecoin.io/proof-of-replication.pdf) and [Proof-of-Spacetime](https://spec.filecoin.io/algorithms/pos/post/)) for the data health.

The need for collateral pledges imposes a series of hurdles for SPs to jump over such as insufficient initial capital in hand or demanding transaction costs overhead, which intimidate SPs against new participation and also hinder long-term growth for Filecoin network as a whole. At present, Filecoin network already possesses a noticeable user base that holds FIL tokens as a valuable asset and is more eager to pursue a stable and profitable investment venue, for asset growth to say the least.

Aligning with interests of the two parties, the bonding bridge introduced in our liquidity protocol provides convenient communication between SP and LP, which reduces collateral barriers for storage services.

## Design

The general design pattern is inspired by the discussion and diagram shown in [here](https://fvm-forum.filecoin.io/t/lending-pool-cookbook/114). Instead of relying on an off-chain solution for loan negotiation between LP and SP, we consider an on-chain alternative to better facilitate collateral pledging purposes.

Objects: SP, Beneficiary, LP, Borrower. NOTE: we set SP as a borrower by default.

Contract: Pool, LoanAgent

Token: WFIL (wrapped FIL), sFIL (staked FIL)

WFIL is a wrapped FIL coin, that provides a seamless and compatible exchange between native coin and other ERC-20 tokens)

sFIL is an ERC-20 certificate for staked WFIL coins.

Action:
  
- supply (deposit): A LP can deposit a certain amount of tokens (FIL) to the pool. For now, we support the WFIL token. In return, the LP would receive an equal amount (i.e. 1-to-1 ratio) of sFIL token. LP also earns interest income as long as the tokens are supplied into the pool. In the future roadmap, for a broader application, other ERC-20 tokens are also acceptable for supplying purposes, attributed to the next planned accessibility, i.e. the protocol offers in-contract swap for targetted sFIL token.

- underwrite: A borrower (SP) can submit a request to borrow FIL token as a collateral pledge. The borrower needs to specify a certain amount to be borrowed. The protocol will automatically calculate interest rates based on on-chain information from the borrower such as slash rate, length of operation, and storage capacity. The borrower needs to provide collateral (could be any other tokens, we could also add an in-contract swap call in order to exchange for FIL tokens if necessary) in order to meet FIL collateral requirements. If borrowed successfully, the Pool contract generates a LoanAgent contract which serves as the proxy on behalf of the SPs miner actor to initialize storage services and collect storage fees. As of implementation details, the owner and beneficiary identity of the miner actor will be delegated to the created LoanAgent contract instance when the LoanAgent is activated (discussed right below)

- activate: LoanAgent owner (SP) can activate the LoanAgent as she sees fit. Once activated, LoanAgent will validate and grant eligibility for storage capacity, and SP is then allowed to provide storage services.

- repay:
    1. The income and reward generated from the miner actor during storage services will be first collected by LoanAgent contract instance.
    2. SP can prescribe repayment activity by calling LoanAgent's API to pay back the loan from the collected income and reward from the LoanAgent contract.
    3. SP also needs to specify a repayment schedule through LoanAgent before activation and the repayment schedule will be rolled out the moment it is activated. If the LoanAgent fails to pull funds for repayment over pre-assigned criteria. LoanAgent retains the right to liquidate the collateral amount during underwriting from the SP.
    4. During each repayment, interest income would also be included in the amount LP should get in each period.
    5. After all repayments are completed, the beneficiary and owner identity of the miner actor will be regained by the SP, after which SP could take on the next storage deals, conditioning on meeting new collateral eligibility.
	
## User experience: 
- SP:
    1. Loan request sent to Pool contract.
    
       1.1 Pool contract instance creates a LoanAgent contract using [create2](https://docs.soliditylang.org/en/latest/control-structures.html#salted-contract-creations-create2), i.e. salted contract creations.
       
       1.2. Pool contract switches miner actor's owner to LoanAgent contract address so that LoanAgent is on behalf of miner actor.
       
    2. SP can activate the LoanAgent loan when she sees fit. During the activation, LoanAgent contract will check the owner address as LoanAgent itself and LoanAgent contract will change the beneficiary address of the miner actor to the LoanAgent.
    	
- LP:
    1. Deposit tokens
    2. Withdraw
    3. Withdraw tokens immediately with reduced interest incomes.
    4. Atomic swap-and-deposit action.
    
## How it's Made

With EVM-compatible virtual machines and a solidity library to call built-in miner actor and also market API powered by Zondax, the protocol enabled loan service for storage providers. The design of the pool contract is motivated by the AAVE liquidity protocol.

### Contract address

- Pool: 0xEe8470960EB3b01cc7c68ddc337c9fDF75cF8882
- WFIL: 0xb4C851a1E4bA5195da3F7cbf2CE381F0a9d28cEC
- sFIL: 0x0E5a82DC378439188d64ffa2455F7bd6a298e38B
- MinerAPI: 0x1c9F963BcEc64585B9da8512A8965bAa7e518BA3
- MarketAPI: 0xBce116D886D1DF284bf3e610F8FE6fA59886B901

### Reference
- https://fvm-forum.filecoin.io/t/lending-pool-cookbook/114
- https://fvm-forum.filecoin.io/t/building-fvm-use-cases/45
- https://github.com/filecoin-project/FIPs/discussions/514
- https://github.com/filecoin-project/FIPs/discussions/508
