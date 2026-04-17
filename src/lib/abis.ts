export const viewsAbi = [
  {
    name: "get_pool_snapshot",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "total_assets", type: "uint256" },
          { name: "total_borrowed", type: "uint256" },
          { name: "available_liquidity", type: "uint256" },
          { name: "utilization", type: "uint256" },
          { name: "share_price", type: "uint256" },
          { name: "current_rate", type: "uint256" },
          { name: "maintenance_margin", type: "uint256" },
          { name: "reserve_balance", type: "uint256" },
          { name: "reserve_healthy", type: "bool" },
          { name: "controller_circuit_broken", type: "bool" },
          { name: "paused", type: "bool" },
          { name: "total_loans", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "get_lender_balance",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "lender", type: "address" }],
    outputs: [
      { name: "shares", type: "uint256" },
      { name: "value", type: "uint256" },
    ],
  },
  {
    name: "preview_liquidation_price",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "collateral_amount", type: "uint256" },
      { name: "borrow_amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const poolCoreAbi = [
  {
    name: "set_market",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "condition_id", type: "bytes32" },
      {
        name: "params",
        type: "tuple",
        components: [
          { name: "token_id", type: "uint256" },
          { name: "min_ltv_bps", type: "uint256" },
          { name: "max_ltv_bps", type: "uint256" },
          { name: "resolution_time", type: "uint256" },
          { name: "origination_cutoff", type: "uint256" },
          { name: "active", type: "bool" },
        ],
      },
    ],
    outputs: [],
  },
  {
    name: "pause_market",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "condition_id", type: "bytes32" }],
    outputs: [],
  },
  {
    name: "get_loan",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "loan_id", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "borrower", type: "address" },
          { name: "condition_id", type: "bytes32" },
          { name: "token_id", type: "uint256" },
          { name: "collateral_amount", type: "uint256" },
          { name: "principal", type: "uint256" },
          { name: "premium_paid", type: "uint256" },
          { name: "interest_due", type: "uint256" },
          { name: "interest_rate_bps", type: "uint256" },
          { name: "liquidation_price", type: "uint256" },
          { name: "epoch_start", type: "uint256" },
          { name: "epoch_end", type: "uint256" },
          { name: "repaid", type: "bool" },
          { name: "liquidated", type: "bool" },
        ],
      },
    ],
  },
  {
    name: "health_factor",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "loan_id", type: "uint256" },
      { name: "price", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const lendingPoolAbi = [
  {
    name: "deposit",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "amount", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "withdraw",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "shares", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "borrow",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "condition_id", type: "bytes32" },
      { name: "collateral_amount", type: "uint256" },
      { name: "borrow_amount", type: "uint256" },
      { name: "epoch_length", type: "uint256" },
      { name: "premium_bps", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "signature", type: "bytes" },
      { name: "price", type: "uint256" },
      { name: "price_timestamp", type: "uint256" },
      { name: "price_deadline", type: "uint256" },
      { name: "price_signature", type: "bytes" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "repay",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "loan_id", type: "uint256" }],
    outputs: [],
  },
  {
    name: "roll_loan",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "old_loan_id", type: "uint256" },
      { name: "epoch_length", type: "uint256" },
      { name: "premium_bps", type: "uint256" },
      { name: "deadline", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "signature", type: "bytes" },
      { name: "price", type: "uint256" },
      { name: "price_timestamp", type: "uint256" },
      { name: "price_deadline", type: "uint256" },
      { name: "price_signature", type: "bytes" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "pause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "unpause",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    name: "trigger_liquidation",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "loan_id", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "price_timestamp", type: "uint256" },
      { name: "price_deadline", type: "uint256" },
      { name: "price_signature", type: "bytes" },
    ],
    outputs: [],
  },
  {
    name: "claim_expired",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "loan_id", type: "uint256" }],
    outputs: [],
  },
  {
    name: "Deposited",
    type: "event",
    inputs: [
      { name: "lender", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "shares", type: "uint256", indexed: false },
    ],
  },
  {
    name: "Withdrawn",
    type: "event",
    inputs: [
      { name: "lender", type: "address", indexed: true },
      { name: "shares", type: "uint256", indexed: false },
      { name: "amount", type: "uint256", indexed: false },
    ],
  },
  {
    name: "LoanOriginated",
    type: "event",
    inputs: [
      { name: "loan_id", type: "uint256", indexed: true },
      { name: "borrower", type: "address", indexed: true },
      { name: "condition_id", type: "bytes32", indexed: true },
      { name: "principal", type: "uint256", indexed: false },
      { name: "premium", type: "uint256", indexed: false },
      { name: "epoch_end", type: "uint256", indexed: false },
    ],
  },
  {
    name: "LoanRepaid",
    type: "event",
    inputs: [{ name: "loan_id", type: "uint256", indexed: true }],
  },
  {
    name: "LoanRolled",
    type: "event",
    inputs: [
      { name: "old_loan_id", type: "uint256", indexed: true },
      { name: "new_loan_id", type: "uint256", indexed: true },
    ],
  },
  {
    name: "LoanLiquidated",
    type: "event",
    inputs: [
      { name: "loan_id", type: "uint256", indexed: true },
      { name: "collateral_to", type: "address", indexed: true },
      { name: "token_id", type: "uint256", indexed: false },
      { name: "collateral_amount", type: "uint256", indexed: false },
      { name: "principal", type: "uint256", indexed: false },
    ],
  },
] as const;

export const erc20Abi = [
  {
    name: "approve",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "allowance",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

export const erc1155Abi = [
  {
    name: "setApprovalForAll",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "operator", type: "address" },
      { name: "approved", type: "bool" },
    ],
    outputs: [],
  },
  {
    name: "isApprovedForAll",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "account", type: "address" },
      { name: "operator", type: "address" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
] as const;
