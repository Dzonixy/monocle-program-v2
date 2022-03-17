use anchor_lang::prelude::*;
use instructions::*;

pub mod instructions;
pub mod state;
pub mod error;

declare_id!("7mhd1er7u7fuitb6KkE38CNmmBsU5nXK8nBu2ff1jsUn");

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
