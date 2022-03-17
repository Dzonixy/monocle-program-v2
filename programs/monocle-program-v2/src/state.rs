use anchor_lang::prelude::*;

#[account]
#[derive(Default, Debug)]
pub struct MonocleNftMetadata {
    pub owner: Pubkey,
    pub creator: Pubkey,
    pub likes: u64,
    // pub comment: String,
}

impl MonocleNftMetadata {
    pub const LEN: usize = SIZE_OF_PUBKEY
                         + SIZE_OF_PUBKEY
                         + SIZE_OF_NUMBER;
}

// const SIZE_OF_STRING: usize = 512;
const SIZE_OF_PUBKEY: usize = 32;
const SIZE_OF_NUMBER: usize = 8;