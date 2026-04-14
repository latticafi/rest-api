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
