# Services Documentation

## Overview

This is the logic behind Avail wallet, this encapsulates account creation, handling of transactions and records, wallet recovery using shamir's secret sharing scheme and storing on the android/ios secure enclaves.

## Services

### generation.rs

This is the initial generation of a wallet for a user. The wallet can either be without a seed phrase or with a seed phrase, if they have a seed phrase then they dont't make use of our recovery system.

The user inputs a username and passoword and chooses if they would like to authenticate using biometrics. Once inputted an aleo keypair is generated and the local storage process starts, along with the sharding as preperation in case of recovery. The user can also choose to allow others to reference them by their username and in that case we store the username and address in Avail's database.

### local_storage

#### iOS

 For iOS we use the iOS keychain, a secure data storage system made by apple, to store the private key and this is protected either by the application password or biometrics. The private key is encrypted by an aes-key generated and stored in the keychain's secure enclave and this is non extractable.

 We use apple's `security-framework` and `local-authentication-framework` to access the keychain and authnetication functionalities.

#### Android

For android we use the android keystore, a secure data storage system made by google. This generates and stores a cryptographic key AES | RSA in a TEE (Trusted Execution Environment) or secure enclave to protect it from extraction. The key is protected by biometrics. Then we encrypt the private key and viewing key using the key in the keystore and store it in the android shared preferences.

In the case of authenticating the user with application password, we hash the password using argon2, generate an aes key from the derived password hash and use that to encrypt a randomly generated aes-key. With the randomly generated aes-key we encrypt the private key and viewing key and store it an sqlite database embeded in the user's application data. The password hash is not stored locally and must be inputted by the user to authenticate and use the keys.

### recovery.rs

This process is only available to those who opt in and do kyc verification so we can prove their identity when they want to recover their wallet.

Using Shamir's secret sharing scheme we split the private key into 3 encrypted shards and these are sent to three entities. These entities are the user's cloud, either iCloud keychain or Gdrive, Avail's secure data storage and our partner's secure data storage. Shamir is set in a way that 2 of the 3 shards is sufficient to reconstruct the original private key.

By default the user's cloud and Avail's secure data storage is used for recovery. When a user wants to recover they do kyc verification and if verified the shard is sent from Avail to the user. Then the shards are reconstructed and the private key is stored locally on the user's device as explained in the local_storage section.

If the shard is not present in the user's specified cloud then we must make use of the partner's secure data storage. Again in this case the user must do kyc verification and input their email address and if verified then recovery will start. We make it clear that in our system only one encrypted shard is ever being transferred using https. Therefore the user will receive two random emails along the following hours and each email will take them to the Avail app and initiate the recovery of a shard in that instance. This is done for security purposes, once both shards are recovered the private key is reconstructed and stored locally on the user's device as explained in the local_storage section.

We will move research and develop a solution that stills verify the user without kyc as we move forward and innovate in the future.

### records.rs

This is the logic behind handling the records of the user locally i.e getting the user's balance and past transaction and filtering the transactions. Also this includes the transfer function allowing to send tokens to someone else on the aleo network.This is done using the aleo rust sdk.
