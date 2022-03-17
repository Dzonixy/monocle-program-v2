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

  it('NFT Creation!', async () => {
    // Add your test here.

    const airdrop_tx = await program.provider.connection.requestAirdrop(
      payer.publicKey,
      2000000000
    );
  
    await program.provider.connection.confirmTransaction(airdrop_tx);
  
    const token = await Token.createMint(
      program.provider.connection,
      payer,
      // mintAuthority.programId,
      payer.publicKey,
      null,
      0,
      TOKEN_PROGRAM_ID
    );

    const tokenAccount = await token.createAssociatedTokenAccount(
      payer.publicKey
    );

    await token.mintTo(
      tokenAccount,
      // mintAuthority.programId,
      payer,
      [payer],
      1,
    );

    console.log("Airdrop transaction signature", airdrop_tx);
    
    const tokenAccountData: any = await program.provider.connection.getParsedAccountInfo(tokenAccount);
    console.log("Token amount => ", tokenAccountData.value.data.parsed.info.tokenAmount.amount);

    const [metadataAccountPda, metaBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from(anchor.utils.bytes.utf8.encode("monocle")),
        token.publicKey.toBuffer(),
    ],
      program.programId
    );

    const [monocleMetadataAccountPda, monoBump] = await PublicKey.findProgramAddress(
      [
        Buffer.from("monocle"),
        token.publicKey.toBuffer(),
        Buffer.from("monocle-metadata")
    ],
      program.programId
    );

    const likes = new anchor.BN(10);
    console.log("About to initialize")
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
          nftMint: token.publicKey,
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
