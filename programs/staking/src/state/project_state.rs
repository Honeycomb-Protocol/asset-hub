use {
    crate::{errors::ErrorCode, traits::*},
    anchor_lang::{prelude::*, solana_program},
};

/// The NFT collection project state account
#[account]
pub struct Project {
    pub bump: u8,
    pub vault_bump: u8,
    pub key: Pubkey,

    /// The wallet that has authority to modify the assembler
    pub authority: Pubkey,

    /// The mint of the token distributed to stakers
    pub reward_mint: Pubkey,

    /// The account owning tokens distributed to stakers
    pub vault: Pubkey,

    /// name of the project
    pub name: String,

    /// The rewards per second
    pub rewards_per_second: u64,

    /// The total number of nfts currently staked.
    pub total_staked: u64,

    /// The unix_timestamp when the statking starts
    pub start_time: i64,

    /// The collection mint addresses to be used for the project
    pub collections: Vec<Pubkey>,

    /// The creator addresses to be used for the project
    pub creators: Vec<Pubkey>,
}
impl Default for Project {
    const LEN: usize = 8 + 184;

    fn set_defaults(&mut self) {
        self.bump = 0;
        self.vault_bump = 0;
        self.key = Pubkey::default();
        self.authority = Pubkey::default();
        self.reward_mint = Pubkey::default();
        self.vault = Pubkey::default();
        self.name = "".to_string();
        self.rewards_per_second = 0;
        self.total_staked = 0;
        self.start_time = 0;
        self.collections = vec![];
        self.creators = vec![];
    }
}

impl Project {
    /// Reallocate account size
    pub fn reallocate<'info>(
        len: isize,
        account_info: AccountInfo<'info>,
        payer_info: AccountInfo<'info>,
        rent_sysvar: &Sysvar<'info, Rent>,
        system_program: &Program<'info, System>,
    ) -> Result<()> {
        let curr_len = isize::try_from(account_info.data_len()).unwrap();
        let new_len = curr_len + len;
        let curr_rent = rent_sysvar.minimum_balance(usize::try_from(curr_len).unwrap());
        let new_rent = rent_sysvar.minimum_balance(usize::try_from(new_len).unwrap());
        let rent_diff: isize =
            isize::try_from(new_rent).unwrap() - isize::try_from(curr_rent).unwrap();

        let account_info_borrow = account_info.clone();
        if rent_diff > 0 {
            solana_program::program::invoke(
                &solana_program::system_instruction::transfer(
                    payer_info.key,
                    account_info_borrow.key,
                    u64::try_from(rent_diff).unwrap(),
                ),
                &[
                    payer_info,
                    account_info_borrow,
                    system_program.to_account_info(),
                ],
            )?;
        } else if rent_diff < 0 {
            let parsed_rent_diff = u64::try_from(rent_diff * -1).unwrap();

            **payer_info.lamports.borrow_mut() = payer_info
                .lamports()
                .checked_add(parsed_rent_diff)
                .ok_or(ErrorCode::Overflow)?;

            **account_info.lamports.borrow_mut() = account_info
                .lamports()
                .checked_sub(parsed_rent_diff)
                .ok_or(ErrorCode::Overflow)?;
        } else {
            return Ok(());
        }

        account_info
            .realloc(usize::try_from(new_len).unwrap(), false)
            .map_err(Into::into)
    }
}
