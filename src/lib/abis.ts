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
] as const;

export const lendingPoolAbi = [
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
] as const;
