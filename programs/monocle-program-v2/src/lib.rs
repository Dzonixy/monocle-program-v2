use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
pub mod state;
pub mod error;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

#[program]
pub mod monocle_program_v2 {
    use super::*;
    pub fn buy_nft(
        ctx: Context<BuyNft>, 
        meta_bump: u8,
        mono_bump: u8,
        name: String, 
        symbol: String,
        uri: String,
        likes: u64,
    ) -> ProgramResult {
        msg!("Program initialized!");
        instructions::buy_nft(
            ctx,  
            meta_bump,
            mono_bump,
            name, 
            symbol,
            uri,
            likes,
        )
    }
}
