export type SpotlightPrograms = {
  version: "0.1.0";
  name: "spotlight_programs";
  instructions: [
    {
      name: "initialize";
      accounts: [
        {
          name: "escrowVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowSolVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "signerAuthority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [];
    },
    {
      name: "request";
      accounts: [
        {
          name: "escrowVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowSolVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "solAmount";
          type: "u64";
        },
      ];
    },
    {
      name: "claim";
      accounts: [
        {
          name: "escrowVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "escrowSolVault";
          isMut: true;
          isSigner: false;
        },
        {
          name: "user";
          isMut: true;
          isSigner: true;
        },
        {
          name: "signerAuthority";
          isMut: false;
          isSigner: true;
        },
        {
          name: "systemProgram";
          isMut: false;
          isSigner: false;
        },
      ];
      args: [
        {
          name: "solAmount";
          type: "u64";
        },
      ];
    },
  ];
  accounts: [
    {
      name: "escrowVault";
      type: {
        kind: "struct";
        fields: [
          {
            name: "solVaultBump";
            type: "u8";
          },
          {
            name: "totalSolAmount";
            type: "u64";
          },
          {
            name: "signerAuthority";
            type: "publicKey";
          },
        ];
      };
    },
  ];
  errors: [
    {
      code: 6000;
      name: "InvalidAuthority";
      msg: "Invalid authority";
    },
  ];
};

export const IDL: SpotlightPrograms = {
  version: "0.1.0",
  name: "spotlight_programs",
  instructions: [
    {
      name: "initialize",
      accounts: [
        {
          name: "escrowVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowSolVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "signerAuthority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [],
    },
    {
      name: "request",
      accounts: [
        {
          name: "escrowVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowSolVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "solAmount",
          type: "u64",
        },
      ],
    },
    {
      name: "claim",
      accounts: [
        {
          name: "escrowVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "escrowSolVault",
          isMut: true,
          isSigner: false,
        },
        {
          name: "user",
          isMut: true,
          isSigner: true,
        },
        {
          name: "signerAuthority",
          isMut: false,
          isSigner: true,
        },
        {
          name: "systemProgram",
          isMut: false,
          isSigner: false,
        },
      ],
      args: [
        {
          name: "solAmount",
          type: "u64",
        },
      ],
    },
  ],
  accounts: [
    {
      name: "escrowVault",
      type: {
        kind: "struct",
        fields: [
          {
            name: "solVaultBump",
            type: "u8",
          },
          {
            name: "totalSolAmount",
            type: "u64",
          },
          {
            name: "signerAuthority",
            type: "publicKey",
          },
        ],
      },
    },
  ],
  errors: [
    {
      code: 6000,
      name: "InvalidAuthority",
      msg: "Invalid authority",
    },
  ],
};
