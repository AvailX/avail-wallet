use bip39::{Mnemonic, MnemonicType, Seed};
use snarkvm::{
    console::prelude::*,
    prelude::{Address, PrivateKey, ViewKey},
};

use avail_common::errors::{AvailError, AvailResult};
use zeroize::Zeroize;

use crate::models::storage::languages::Languages;

#[derive(Debug)]
pub struct BetterAvailWallet<N: Network> {
    pub address: Address<N>,
    pub view_key: ViewKey<N>,
    pub private_key: PrivateKey<N>,
    pub mnemonic: Option<Mnemonic>,
}

impl<N: Network> PartialEq for BetterAvailWallet<N> {
    fn eq(&self, other: &Self) -> bool {
        self.private_key == other.private_key
            && self.address == other.address
            && self.view_key == other.view_key
    }
}

impl<N: Network> Eq for BetterAvailWallet<N> {}

impl<N: Network> BetterAvailWallet<N> {
    /// Generates a new [`BetterAvailWallet`], whilst throwing an error if the seed phrase length is not 12, 15, 18, 21, or 24.
    ///
    /// ```
    /// use availx_lib::models::wallet::BetterAvailWallet;
    /// # use availx_lib::models::storage::languages::Languages;
    /// # use snarkvm::prelude::Testnet3;
    ///
    /// let wallet = BetterAvailWallet::<Testnet3>::new(24, &Languages::English);
    ///
    /// assert!(wallet.is_ok());
    /// ```
    pub fn new(seed_phrase_len: usize, seed_lang: &Languages) -> AvailResult<Self> {
        let mnemonic = Mnemonic::new(
            MnemonicType::for_word_count(seed_phrase_len)?,
            Languages::to_bip39_language(seed_lang),
        );

        // NOTE: EMPTY BECAUSE WE ARE NOT USING PASSWORDS FOR SPs
        let seed = Seed::new(&mnemonic, "");

        Self::from_mnemonic_seed(seed, mnemonic)
    }

    ///  This method returns the bytes of the [`Field`] used to derive an Aleo [(docs)](https://developer.aleo.org/concepts/accounts#create-an-account) [`PrivateKey`].
    ///
    ///  Not to be confused with [`Seed`].
    pub fn get_seed_bytes(&self) -> AvailResult<Vec<u8>> {
        let seed_bytes = self.private_key.to_bytes_le()?;

        Ok(seed_bytes)
    }

    /// Generates an [`AvailWallet`] from an arbitrary seed phrase, using the specified [`Language`].
    pub fn from_seed_phrase(seed_phrase: &str, lang: bip39::Language) -> AvailResult<Self> {
        let mnemonic = Mnemonic::from_phrase(seed_phrase, lang)?;
        let seed = Seed::new(&mnemonic, "");

        Self::from_mnemonic_seed(seed, mnemonic)
    }

    /// Generates a [`BetterAvailWallet`] from the [`Seed`] of a [`Mnemonic`].
    pub fn from_mnemonic_seed(seed: Seed, mnemonic: Mnemonic) -> AvailResult<Self> {
        let bytes = &mut seed.as_bytes()[0..=32].to_vec();

        let field = <N as Environment>::Field::from_bytes_le_mod_order(bytes);

        let private_key =
            PrivateKey::<N>::try_from(FromBytes::read_le(&*field.to_bytes_le().unwrap()).unwrap())?;

        bytes.zeroize();

        let view_key = ViewKey::<N>::try_from(&private_key)?;
        let address = Address::<N>::try_from(&private_key)?;

        Ok(BetterAvailWallet::<N> {
            address,
            view_key,
            private_key,
            mnemonic: Some(mnemonic),
        })
    }

    /// Gets the private key string of an avail wallet.
    pub fn get_private_key(&self) -> String {
        self.private_key.to_string()
    }

    /// Gets the view key string of an avail wallet.
    pub fn get_view_key(&self) -> String {
        self.view_key.to_string()
    }

    /// Gets the address string of an avail wallet.
    pub fn get_address(&self) -> String {
        self.address.to_string()
    }

    pub fn get_network(&self) -> String {
        N::NAME.to_string()
    }
}

/// Implementing the `Display` trait for the `BetterAvailWallet` struct.
impl<N: Network> Display for BetterAvailWallet<N> {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.private_key)
    }
}

/// Implementing the `TryFrom` trait for the `BetterAvailWallet` struct.
impl<N: Network> TryFrom<String> for BetterAvailWallet<N> {
    type Error = AvailError;

    fn try_from(value: String) -> AvailResult<Self> {
        let private_key = PrivateKey::<N>::from_str(&value)?;
        let view_key = ViewKey::<N>::try_from(&private_key)?;
        let address = Address::<N>::try_from(&private_key)?;

        Ok(BetterAvailWallet::<N> {
            address,
            view_key,
            private_key,
            mnemonic: None,
        })
    }
}

impl<N: Network> TryFrom<&str> for BetterAvailWallet<N> {
    type Error = AvailError;

    fn try_from(value: &str) -> AvailResult<Self> {
        let private_key = PrivateKey::<N>::from_str(value)?;
        let view_key = ViewKey::<N>::try_from(&private_key)?;
        let address = Address::<N>::try_from(&private_key)?;

        Ok(BetterAvailWallet::<N> {
            address,
            view_key,
            private_key,
            mnemonic: None,
        })
    }
}

impl<N: Network> TryFrom<PrivateKey<N>> for BetterAvailWallet<N> {
    type Error = AvailError;

    fn try_from(value: PrivateKey<N>) -> AvailResult<Self> {
        let view_key = ViewKey::<N>::try_from(&value)?;
        let address = Address::<N>::try_from(&value)?;

        Ok(BetterAvailWallet::<N> {
            address,
            view_key,
            private_key: value,
            mnemonic: None,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use rstest::rstest;
    use snarkvm::prelude::Testnet3;

    const PRIVATE_KEY: &str = "APrivateKey1zkpDqSfXcDcHdsvjkQhzF4NHTPPC63CBRHyaarTP3NAcHvg";
    const PHRASE: &str = "brave pass marine truly lecture fancy rail exotic destroy health always thunder wife decide situate index secret enter cruise prosper pudding about barely quit";

    #[rstest]
    fn test_create_random_avail_wallet(#[values(12, 15, 18, 21, 24)] seed_phrase_len: usize) {
        let wallet = BetterAvailWallet::<Testnet3>::new(seed_phrase_len, &Languages::English);

        assert!(wallet.is_ok());

        let wallet = wallet.unwrap();
        println!("Wallet: {}", wallet.get_private_key());
    }

    #[rstest]
    fn test_from_seed_bytes(#[values(12, 15, 18, 21, 24)] seed_phrase_len: usize) {
        let mnemonic = Mnemonic::new(
            MnemonicType::for_word_count(seed_phrase_len).unwrap(),
            Languages::to_bip39_language(&Languages::English),
        );

        assert_eq!(mnemonic.phrase().split(" ").count(), seed_phrase_len);

        let seed = Seed::new(&mnemonic, "");
        let bytes = &mut seed.as_bytes()[0..32].to_vec();

        assert_eq!(bytes.len(), 32);

        let wallet = BetterAvailWallet::<Testnet3>::from_mnemonic_seed(seed, mnemonic);

        assert!(wallet.is_ok());
    }

    #[rstest]
    /// Test that a wallet can be created from the seed phrase.
    fn test_get_seed_bytes(#[values(12, 15, 18, 21, 24)] seed_phrase_len: usize) {
        let wallet =
            BetterAvailWallet::<Testnet3>::new(seed_phrase_len, &Languages::English).unwrap();
        let seed_bytes = wallet.get_seed_bytes().unwrap();

        assert_eq!(seed_bytes.len(), 32);
    }

    #[rstest]
    /// Test that an avail wallet can be created from the seed phrase.
    fn test_from_seed_phrase() {
        let mnemonic = Mnemonic::from_phrase(PHRASE, bip39::Language::English).unwrap();

        let seed_phrase = mnemonic.phrase();

        let wallet = BetterAvailWallet::<Testnet3>::from_seed_phrase(
            seed_phrase,
            Languages::to_bip39_language(&Languages::English),
        );

        assert!(wallet.is_ok());

        let wallet = wallet.unwrap();

        assert_eq!(wallet.get_private_key(), PRIVATE_KEY)
    }

    #[rstest]
    /// Test that the private key string can be retrieved from the avail wallet.
    fn test_get_private_key() {
        let wallet = BetterAvailWallet::<Testnet3>::try_from(PRIVATE_KEY).unwrap();
        let private_key = wallet.get_private_key();

        assert_eq!(private_key, PRIVATE_KEY);
    }

    #[rstest]
    /// Test that the address string can be retrieved from the avail wallet.
    fn test_get_view_key() {
        let wallet = BetterAvailWallet::<Testnet3>::try_from(PRIVATE_KEY).unwrap();
        let view_key = wallet.get_view_key();

        assert_eq!(
            view_key,
            "AViewKey1icabKrKXiTjKnk1fd2p8NZ9etV8KZKNrejtiaHnav34N"
        );
    }

    #[rstest]
    fn test_get_address() {
        let wallet = BetterAvailWallet::<Testnet3>::try_from(PRIVATE_KEY).unwrap();
        let address = wallet.get_address();

        assert_eq!(
            address,
            "aleo1lavuvpvklv3fdjwesr4pp5wekq2gjahu00krprnx8c2wc5xepuyqv64xk8"
        )
    }
}
