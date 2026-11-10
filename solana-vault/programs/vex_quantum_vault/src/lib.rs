use anchor_lang::prelude::*;
use anchor_lang::system_program;

declare_id!("VexQuantumVault11111111111111111111111111111");

#[program]
pub mod vex_quantum_vault {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.bump = ctx.bumps.vault;
        vault.authority = ctx.accounts.authority.key();
        Ok(())
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64, ml_dsa_pubkey: [u8; 32]) -> Result<()> {
        require!(amount > 0, ErrorCode::ZeroAmount);
        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.user.to_account_info(),
            to: ctx.accounts.vault.to_account_info(),
        };
        let cpi_ctx = CpiContext::new(ctx.accounts.system_program.to_account_info(), cpi_accounts);
        system_program::transfer(cpi_ctx, amount)?;
        let user_balance = &mut ctx.accounts.user_balance;
        user_balance.ml_dsa_pubkey = ml_dsa_pubkey;
        user_balance.amount = user_balance.amount.checked_add(amount).unwrap();
        user_balance.bump = ctx.bumps.user_balance;
        Ok(())
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64, _signature: Vec<u8>, _message: Vec<u8>) -> Result<()> {
        require!(amount > 0, ErrorCode::ZeroAmount);
        let user_balance = &mut ctx.accounts.user_balance;
        require!(user_balance.amount >= amount, ErrorCode::InsufficientFunds);
        // ML-DSA verify hook goes here
        let vault_seeds = &[b"vault".as_ref(), &[ctx.accounts.vault.bump]];
        let signer = &[&vault_seeds[..]];
        let cpi_accounts = system_program::Transfer {
            from: ctx.accounts.vault.to_account_info(),
            to: ctx.accounts.destination.to_account_info(),
        };
        let cpi_ctx = CpiContext::new_with_signer(ctx.accounts.system_program.to_account_info(), cpi_accounts, signer);
        system_program::transfer(cpi_ctx, amount)?;
        user_balance.amount = user_balance.amount.checked_sub(amount).unwrap();
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = authority, space = 8 + 32 + 1, seeds = [b"vault"], bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [b"vault"], bump = vault.bump)]
    pub vault: Account<'info, Vault>,
    #[account(init_if_needed, payer = user, space = 8 + 32 + 8 + 1, seeds = [b"balance", user.key().as_ref()], bump)]
    pub user_balance: Account<'info, UserBalance>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut, seeds = [b"vault"], bump = vault.bump)]
    pub vault: Account<'info, Vault>,
    #[account(mut, seeds = [b"balance", authority.key().as_ref()], bump = user_balance.bump)]
    pub user_balance: Account<'info, UserBalance>,
    /// CHECK: destination
    #[account(mut)]
    pub destination: UncheckedAccount<'info>,
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[account]
pub struct Vault {
    pub authority: Pubkey,
    pub bump: u8,
}

#[account]
pub struct UserBalance {
    pub ml_dsa_pubkey: [u8; 32],
    pub amount: u64,
    pub bump: u8,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Insufficient funds")]
    InsufficientFunds,
    #[msg("Invalid ML-DSA signature")]
    InvalidSignature,
}
