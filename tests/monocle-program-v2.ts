import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { MonocleProgramV2 } from '../target/types/monocle_program_v2';
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from "@solana/spl-token";

describe('monocle-program-v2', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.MonocleProgramV2 as Program<MonocleProgramV2>;

  const payer = anchor.web3.Keypair.generate();
  const mintAuthority = program;

  //   await this.token.mintTo(
  //     this.tokenAccount,
  //     this.mintAuthority.publicKey,
  //     [this.mintAuthority],
  //     this.depositAmount
  //   );
  // }

  it('NFT Creation!', async () => {
    // Add your test here.

    const tx = await program.provider.connection.requestAirdrop(
      payer.publicKey,
      2000000000
    );
  
    await program.provider.connection.confirmTransaction(tx);
  
    const mint = await Token.createMint(
      program.provider.connection,
      payer,
      mintAuthority.programId,
      null,
      0,
      TOKEN_PROGRAM_ID
    );

    const tokenAccount = await mint.createAssociatedTokenAccount(
      payer.publicKey
    );

    console.log("Airdrop transaction signature", tx);
    
    const [metadataAccountPda, metaBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("monocle")),
        mint.publicKey.toBuffer(),
    ],
      program.programId
    );

    const [monocleMetadataAccountPda, monoBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("monocle")),
        mint.publicKey.toBuffer(),
        Buffer.from(anchor.utils.bytes.utf8.encode("monocle-metadata"))
    ],
      program.programId
    );

    const likes = new anchor.BN(10);

    const buyTx = await program.rpc.buyNft(
      new anchor.BN(metaBump),
      new anchor.BN(monoBump),
      "test-name",
      "test-symbol",
      "test-uri",
      likes,
      {
        accounts: {
          metadataAccount: metadataAccountPda,
          monocleMetadata: monocleMetadataAccountPda,
          nftMint: mint.publicKey,
          mintAuthority: program.programId,
          payer: payer.publicKey,
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
        },
        signers: [payer]
      }
    );

    console.log(buyTx);

  });
});
