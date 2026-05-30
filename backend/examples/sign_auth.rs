//! Dev-only helper: derive wallet + sign auth nonce messages for smoke tests.
use ed25519_dalek::{Signer, SigningKey};

fn wallet_and_key(seed: u8) -> (String, SigningKey) {
    let signing_key = SigningKey::from_bytes(&[seed; 32]);
    let wallet = bs58::encode(signing_key.verifying_key().as_bytes()).into_string();
    (wallet, signing_key)
}

fn sign_message(signing_key: &SigningKey, message: &str) -> String {
    bs58::encode(signing_key.sign(message.as_bytes()).to_bytes()).into_string()
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    if args.len() != 3 {
        eprintln!("Usage: sign_auth <seed_byte> <message>");
        std::process::exit(1);
    }

    let seed: u8 = args[1].parse().expect("seed must be 0-255");
    let message = &args[2];
    let (wallet, key) = wallet_and_key(seed);
    let signature = sign_message(&key, message);

    println!("WALLET={wallet}");
    println!("SIGNATURE={signature}");
}
