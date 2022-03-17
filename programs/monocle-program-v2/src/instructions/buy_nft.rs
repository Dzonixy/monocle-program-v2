use anchor_lang::{
    prelude::*,
    solana_program::{
        system_instruction::create_account, 
        program::invoke_signed,
        system_program,
    },
};
use anchor_spl::token::{Mint, Token};
use mpl_token_metadata::
    state::{ 
        Metadata, 
        Data, 
        TokenStandard::NonFungible,
        Key::MetadataV1,
}; 
use crate::{
    state::*,
    constants::*,
    error::MonocleErrors,
};

#[derive(Accounts)]
#[instruction(meta_bump: u8, mono_bump: u8)]
pub struct BuyNft<'info> {
    #[account(
        mut,
        seeds = [MONOCLE_SEED, nft_mint.key().as_ref()],
        bump = meta_bump,
    )]
    pub metadata_account: UncheckedAccount<'info>,
    #[account(
        init_if_needed,
        seeds = [MONOCLE_SEED, nft_mint.key().as_ref(), METADATA_SEED],
        bump = mono_bump,
        payer = payer,
    )]
    pub monocle_metadata: Account<'info, MonocleNftMetadata>,
    #[account(mut)]
    pub nft_mint: Account<'info, Mint>,
    #[account()]
    pub mint_authority: AccountInfo<'info>,
    #[account(mut)]
    pub payer: Signer<'info>,

    pub system_program: Program<'info, System>,
    pub token_program: Program<'info, Token>,  
}

pub fn buy_nft(
    ctx: Context<BuyNft>,
    meta_bump: u8,
    _mono_bump: u8, 
    name: String, 
    symbol: String,
    uri: String,
    likes: u64,
    ) -> ProgramResult {    
        msg!("Proccess initialized!");
        if !(ctx.accounts.metadata_account.data_is_empty() && 
                *ctx.accounts.metadata_account.owner == system_program::id()) {
            return Err(MonocleErrors::PdaAlreadyInitialized.into());
        }

        let metadata = Metadata {
            key: MetadataV1,
            update_authority: *ctx.program_id,
            mint: *ctx.accounts.nft_mint.to_account_info().key,
            data: Data { 
                name: name.clone(),
                symbol: symbol.clone(),
                uri: uri.clone(),
                seller_fee_basis_points: 0,
                creators: None,
            },
            primary_sale_happened: true,
            is_mutable: true,
            edition_nonce: None,
            token_standard: Some(NonFungible),
            collection: None,
            uses: None,
        };
        let serialized_data = metadata.try_to_vec()?;
        let account_size = serialized_data.len();

        let rent = Rent::get()?;

        let create_account_instruction = create_account(
            &ctx.accounts.payer.key,
            &ctx.accounts.metadata_account.key,
            rent.minimum_balance(account_size),
            account_size as u64,
            &ctx.program_id,
        );

        let seeds: &[&[_]] = &[
            MONOCLE_SEED, 
            &ctx.accounts.nft_mint.key().to_bytes(), 
            &[meta_bump],
        ];

        invoke_signed(
            &create_account_instruction, 
            &[
                ctx.accounts.payer.to_account_info().clone(),
                ctx.accounts.metadata_account.to_account_info().clone(),
                ctx.accounts.system_program.to_account_info().clone(),
            ],
            &[&seeds],
        )?;

        ctx.accounts.metadata_account.data.borrow_mut().copy_from_slice(&serialized_data);

        // msg!("\n\n\nMETAPLEX METADATA ACCOUNT DATA: {:?}\n\n\n", ctx.accounts.metadata_account.data);

        let monocle_metadata = &mut ctx.accounts.monocle_metadata;
        monocle_metadata.likes = likes;
        monocle_metadata.owner = ctx.accounts.payer.key();
        monocle_metadata.creator = ctx.accounts.mint_authority.key();

        Ok(())
}