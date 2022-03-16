import * as anchor from '@project-serum/anchor';
import { Program } from '@project-serum/anchor';
import { MonocleProgramV2 } from '../target/types/monocle_program_v2';

describe('monocle-program-v2', () => {

  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.Provider.env());

  const program = anchor.workspace.MonocleProgramV2 as Program<MonocleProgramV2>;

  it('Is initialized!', async () => {
    // Add your test here.
    const tx = await program.rpc.buyNft({});
    console.log("Your transaction signature", tx);
  });
});
