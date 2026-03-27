use soroban_sdk::{contracttype, Env};

pub trait StateMachine {
    type State;

    /// Checks if a transition from `from` to `to` is valid.
    fn is_valid_transition(env: &Env, from: &Self::State, to: &Self::State) -> bool;
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum SubscriptionStatus {
    Trial,
    Active,
    GracePeriod,
    Paused,
    Cancelled,
    Expired,
}

impl StateMachine for SubscriptionStatus {
    type State = Self;
    fn is_valid_transition(_env: &Env, from: &Self::State, to: &Self::State) -> bool {
        match (from, to) {
            (SubscriptionStatus::Trial, SubscriptionStatus::Active) => true,
            (SubscriptionStatus::Trial, SubscriptionStatus::Cancelled) => true,
            (SubscriptionStatus::Active, SubscriptionStatus::GracePeriod) => true,
            (SubscriptionStatus::Active, SubscriptionStatus::Paused) => true,
            (SubscriptionStatus::Active, SubscriptionStatus::Cancelled) => true,
            (SubscriptionStatus::GracePeriod, SubscriptionStatus::Active) => true,
            (SubscriptionStatus::GracePeriod, SubscriptionStatus::Expired) => true,
            (SubscriptionStatus::Paused, SubscriptionStatus::Active) => true,
            (SubscriptionStatus::Paused, SubscriptionStatus::Cancelled) => true,
            _ => false,
        }
    }
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum LoanStatus {
    Pending,
    Active,
    Repaid,
    Defaulted,
    Cancelled,
}

impl StateMachine for LoanStatus {
    type State = Self;
    fn is_valid_transition(_env: &Env, from: &Self::State, to: &Self::State) -> bool {
        match (from, to) {
            (LoanStatus::Pending, LoanStatus::Active) => true,
            (LoanStatus::Pending, LoanStatus::Cancelled) => true,
            (LoanStatus::Active, LoanStatus::Repaid) => true,
            (LoanStatus::Active, LoanStatus::Defaulted) => true,
            _ => false,
        }
    }
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ISAStatus {
    Pending,
    StudyPeriod,
    GracePeriod,
    Repayment,
    Completed,
    Defaulted,
}

impl StateMachine for ISAStatus {
    type State = Self;
    fn is_valid_transition(_env: &Env, from: &Self::State, to: &Self::State) -> bool {
        match (from, to) {
            (ISAStatus::Pending, ISAStatus::StudyPeriod) => true,
            (ISAStatus::StudyPeriod, ISAStatus::GracePeriod) => true,
            (ISAStatus::GracePeriod, ISAStatus::Repayment) => true,
            (ISAStatus::Repayment, ISAStatus::Completed) => true,
            (ISAStatus::Repayment, ISAStatus::Defaulted) => true,
            _ => false,
        }
    }
}
