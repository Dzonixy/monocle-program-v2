use anchor_lang::prelude::*;

#[error]
pub enum MonocleErrors {
    #[msg("PDA already Initialized")]
    PdaAlreadyInitialized,
}