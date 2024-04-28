use avail_common::models::network::SupportedNetworks;
use jni::objects::{JByteArray, JClass, JMap, JObject, JString, JValue};

use jni::{JNIEnv, JavaVM};
use ndk_context;
use snarkvm::prelude::*;
use std::ffi::c_void;

use crate::api::{encrypted_data::delete_all_server_storage, user::delete_user};

use crate::models::{
    auth::Options,
    storage::encryption::{EncryptedData, Keys, Keys::PrivateKey as PKey, Keys::ViewKey as VKey},
    wallet::BetterAvailWallet,
};

use crate::services::local_storage::{
    persistent_storage::{
        delete_user_preferences, get_auth_type, get_network,
    },
    encrypted_data::delete_user_encrypted_data,
    utils::encrypt_with_password,
};

use avail_common::{
    aleo_tools::encryptor::Encryptor,
    errors::{AvailError, AvailErrorType, AvailResult},
};

#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn Java_com_example_keystore_KeyStoreModule_create(
    mut env: JNIEnv,
    class: JClass,
    alias: JString,
    p_key: JByteArray,
    v_key: JByteArray,
    options: JObject,
    context: JObject,
) -> AvailResult<()> {
    let j_context = JValue::Object(&context);
    print!("Error cause of params?");
    let keystore_module = env.new_object(class, "(Landroid/content/Context;)V", &[j_context])?;

    let keystore_module_ref = env.new_global_ref(keystore_module)?;

    let j_alias = JValue::Object(&alias);
    let j_pkey = JValue::Object(&p_key);
    let j_vkey = JValue::Object(&v_key);
    let j_options = JValue::Object(&options);

    let result = env.call_method(
        keystore_module_ref,
        "setGenericPassword",
        "(Ljava/lang/String;[B[BLjava/util/Map;Landroid/content/Context;)Ljava/util/Map;",
        &[j_alias, j_pkey, j_vkey, j_options, j_context],
    )?;

    let exceptions = env.exception_occurred()?;

    if exceptions.is_null() {
        println!("No exception occurred");
    } else {
        println!("Exception occurred");
        env.exception_describe()?;
        env.exception_clear()?;
    }

    let result = result.l()?;

    println!("{:#?}", result);
    Ok(())
}

#[allow(non_snake_case)]
pub extern "system" fn Java_com_example_keystore_KeyStoreModule_get(
    mut env: JNIEnv,
    class: JClass,
    alias: JString,
    options: JObject,
    context: JObject,
    key_type: JString,
) -> AvailResult<Vec<u8>> {
    let j_context = JValue::Object(&context);

    let keystore_module = env.new_object(class, "(Landroid/content/Context;)V", &[j_context])?;

    let keystore_module_ref = env.new_global_ref(keystore_module)?;

    let j_alias = JValue::Object(&alias);
    let j_options = JValue::Object(&options);
    let j_key_type = JValue::Object(&key_type);

    let result = env.call_method(
        keystore_module_ref,
        "getGenericPassword",
        "(Ljava/lang/String;Ljava/util/Map;Landroid/content/Context;Ljava/lang/String;)Ljava/util/Map;",
        &[j_alias, j_options, j_context, j_key_type],
    )?;

    let exceptions = env.exception_occurred()?;
    if exceptions.is_null() {
        println!("No exception occurred");
    } else {
        println!("Exception occurred");
        env.exception_describe()?;
        env.exception_clear()?;
    }

    let result = result.l()?;

    //turn result to map then iterate through map to get values which are bytes

    let JMap = JMap::from_env(&mut env, &result)?;

    let mut iter = JMap.iter(&mut env)?;

    // there will be two key value pairs in the map, one for username and one for password

    let p_key_value = iter.next(&mut env)?;

    let p_key_value = match p_key_value {
        Some(p) => p,
        None => {
            return Err(AvailError::new(
                AvailErrorType::LocalStorage,
                "No key value pair found".to_string(),
                "No key value pair found".to_string(),
            ))
        }
    };

    let v_key_value = iter.next(&mut env)?;

    let v_key_value = match v_key_value {
        Some(v) => v,
        None => {
            return Err(AvailError::new(
                AvailErrorType::LocalStorage,
                "No key value pair found".to_string(),
                "No key value pair found".to_string(),
            ))
        }
    };

    let key_raw = p_key_value.1.as_raw();
    let key = unsafe { JByteArray::from_raw(key_raw) };
    let p_key = env.convert_byte_array(key)?;

    let key_raw = v_key_value.1.as_raw();
    let key = unsafe { JByteArray::from_raw(key_raw) };
    let v_key = env.convert_byte_array(key)?;

    // println!("PKbytes {:?}", p_key);
    // print!("VKbytes {:?}", v_key);

    let key_type = env.get_string(&key_type)?;
    let key_type = key_type.to_str();

    let key_type = match key_type {
        Ok(k) => k,
        Err(_e) => {
            return Err(AvailError::new(
                AvailErrorType::LocalStorage,
                "Error converting key type".to_string(),
                "Error converting key type".to_string(),
            ))
        }
    };
    match key_type {
        "avl-p" => Ok(p_key),
        "avl-v" => Ok(v_key),
        _ => Err(AvailError::new(
            AvailErrorType::InvalidData,
            "Invalid key type".to_string(),
            "Invalid key type".to_string(),
        )),
    }
}

#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn Java_com_example_keystore_KeyStoreModule_delete(
    mut env: JNIEnv,
    class: JClass,
    alias: JString,
    context: JObject,
) -> AvailResult<()> {
    let j_context = JValue::Object(&context);

    let keystore_module = env.new_object(class, "(Landroid/content/Context;)V", &[j_context])?;

    let keystore_module_ref = env.new_global_ref(keystore_module)?;

    let j_alias = JValue::Object(&alias);

    let _result = env.call_method(
        keystore_module_ref,
        "resetGenericPassword",
        "(Ljava/lang/String;)Z",
        &[j_alias],
    )?;

    let exceptions = env.exception_occurred()?;

    if exceptions.is_null() {
        println!("No exception occurred");
    } else {
        println!("Exception occurred");
        env.exception_describe()?;
        env.exception_clear()?;
    };

    Ok(())
}

/// Checks if the device supports biometric authentication using jni
#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn Java_com_example_keystore_KeyStoreModule_check(
    mut env: JNIEnv,
    class: JClass,
    context: JObject,
) -> AvailResult<bool> {
    let j_context = JValue::Object(&context);

    let keystore_module = env.new_object(class, "(Landroid/content/Context;)V", &[j_context])?;

    let keystore_module_ref = env.new_global_ref(keystore_module)?;

    let result = env.call_method(
        keystore_module_ref,
        "checkBio",
        "(Landroid/content/Context;)Z",
        &[j_context],
    )?;

    let exceptions = env.exception_occurred()?;

    if exceptions.is_null() {
        println!("No exception occurred");
    } else {
        println!("Exception occurred");
        env.exception_describe()?;
        env.exception_clear()?;
    }

    Ok(result.z()?)
}

/// Checks if the app has permission to use biometric authentication
#[no_mangle]
#[allow(non_snake_case)]
pub extern "system" fn Java_com_example_keystore_KeyStoreModule_permission(
    mut env: JNIEnv,
    class: JClass,
    context: JObject,
) -> AvailResult<bool> {
    let j_context = JValue::Object(&context);

    let keystore_module = env.new_object(class, "(Landroid/content/Context;)V", &[j_context])?;

    let keystore_module_ref = env.new_global_ref(keystore_module)?;

    let result = env.call_method(
        keystore_module_ref,
        "checkBiometryPermission",
        "(Landroid/content/Context;)Z",
        &[j_context],
    )?;

    let exceptions = env.exception_occurred()?;

    if exceptions.is_null() {
        println!("No exception occurred");
    } else {
        println!("Exception occurred");
        env.exception_describe()?;
        env.exception_clear()?;
    }

    Ok(result.z()?)
}

/// Creates a JVM instance and returns a tuple of the JVM and the activity context
fn prepare_jvm() -> AvailResult<(JavaVM, *mut c_void)> {
    let ctx = ndk_context::android_context();
    let vm = unsafe { jni::JavaVM::from_raw(ctx.vm().cast()) }?;

    let activity = ctx.context();

    Ok((vm, activity))
}

// TODO: Collect common code -> Having problems with lifetimes and borrowing

///Creates or loads an instance of keystore, generating a protected RSA Key and stores
///encrypted username, encrypted password and salt in SharedPreferences.
#[tauri::command(rename_all = "snake_case")]
pub fn keystore_init<N: Network>(
    password: &str,
    access_type: bool,
    p_key: &PrivateKey<N>,
    v_key: &ViewKey<N>,
) -> AvailResult<String> {
    let mut auth_options = Options::default();

    if access_type {
        println!("Biometric access enabled");
        auth_options.accessControl = Some("BiometryCurrentSet".to_string());
    };

    let (jvm, activity) = prepare_jvm()?;

    let _env = jvm.attach_current_thread()?;

    let mut env = jvm.get_env()?;

    let class = env.find_class("com/example/keystore/KeyStoreModule")?;

    let class2 = **class;
    let class2 = unsafe { JClass::from_raw(class2) };

    let service = env.new_string(auth_options.service)?;
    let title = env.new_string(auth_options.title)?;
    let subtitle = env.new_string(auth_options.subtitle)?;
    let description = env.new_string(auth_options.description)?;
    let cancel = env.new_string(auth_options.cancel)?;
    let accessible = env.new_string(auth_options.accessible)?;
    let security_level = env.new_string(auth_options.securityLevel)?;

    let mut access_control = JObject::from(env.new_string("None")?);
    let acc = auth_options.accessControl;

    if let Some(a) = acc {
        access_control = JObject::from(env.new_string(a)?);
    }

    let mut storage = JObject::from(env.new_string("Best")?);
    let sto = auth_options.storage;

    if let Some(s) = sto {
        storage = JObject::from(env.new_string(s)?);
    }

    let mut authentication_type = JObject::null();
    let aut = auth_options.authenticationType;

    if let Some(a) = aut {
        authentication_type = JObject::from(env.new_string(a)?);
    }

    let jservice = JValue::Object(&service);
    let jtitle = JValue::Object(&title);
    let jsubtitle = JValue::Object(&subtitle);
    let jdescription = JValue::Object(&description);
    let jcancel = JValue::Object(&cancel);
    let jaccessible = JValue::Object(&accessible);
    let jaccess_control = JValue::Object(&access_control);
    let jstorage = JValue::Object(&storage);
    let jsecurity_level = JValue::Object(&security_level);
    let jauthentication_type = JValue::Object(&authentication_type);

    let result = env.call_static_method(class, "constructOptions",
    "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/util/Map;",
    &[jservice, jtitle, jsubtitle, jdescription, jcancel, jaccessible, jaccess_control, jstorage, jsecurity_level, jauthentication_type])?;

    let exceptions = env.exception_occurred()?;

    if exceptions.is_null() {
        println!("No exception occurred");
    } else {
        println!("Exception occurred");
        env.exception_describe()?;
        env.exception_clear()?;
    }

    let options = result.l()?;

    let alias = env.new_string("AV_KEYSTORE")?;

    let context = unsafe { JObject::from_raw(activity as jni::sys::jobject) };

    match access_type {
        true => {
            let p_key = env.byte_array_from_slice(&p_key.to_bytes_le()?)?;
            let v_key = env.byte_array_from_slice(&v_key.to_bytes_le()?)?;
            Java_com_example_keystore_KeyStoreModule_create(
                env, class2, alias, p_key, v_key, options, context,
            )?;
        }
        false => {
            let network = get_network()?;
            print!("Got here son");
            let ciphertext_p = match SupportedNetworks::from_str(&network)? {
                SupportedNetworks::Testnet3 => {
                    match encrypt_with_password::<N>(password, &PKey(*p_key)) {
                        Ok(c) => c,
                        Err(e) => {
                            println!("Error encrypting view key: {}", e);
                            return Err(AvailError::new(
                                AvailErrorType::Internal,
                                "Error encrypting private key".to_string(),
                                "Error encrypting private key".to_string(),
                            ));
                        }
                    }
                }
            };

            let ciphertext_v = match SupportedNetworks::from_str(&network)? {
                SupportedNetworks::Testnet3 => {
                    match encrypt_with_password::<N>(password, &VKey(*v_key)) {
                        Ok(c) => c,
                        Err(e) => {
                            println!("Error encrypting view key: {}", e);
                            return Err(AvailError::new(
                                AvailErrorType::Internal,
                                "Error encrypting view key".to_string(),
                                "Error encrypting view key".to_string(),
                            ));
                        }
                    }
                }
            };

            let p_key = env.byte_array_from_slice(&ciphertext_p.to_bytes_le()?)?;
            let v_key = env.byte_array_from_slice(&ciphertext_v.to_bytes_le()?)?;

            Java_com_example_keystore_KeyStoreModule_create(
                env, class2, alias, p_key, v_key, options, context,
            )?;
        }
    }

    Ok("Key stored".to_string())
}

///Uses the key in keystore to decrypt the hash stored in SharedPreferences.
#[tauri::command(rename_all = "snake_case")]
pub fn keystore_load<N: Network>(password: Option<&str>, key_type: &str) -> AvailResult<Keys<N>> {
    let auth_options = Options::default();
    let auth_type = get_auth_type()?;

    if !auth_type {
        let _pass = password.ok_or(AvailError::new(
            AvailErrorType::Internal,
            "Login".to_string(),
            "Login".to_string(),
        ))?;
    };

    let (jvm, activity) = prepare_jvm()?;

    jvm.attach_current_thread()?;

    let mut env = jvm.get_env()?;

    let class = env.find_class("com/example/keystore/KeyStoreModule")?;

    let class2 = **class;
    let class2 = unsafe { JClass::from_raw(class2) };

    let service = env.new_string(auth_options.service)?;
    let title = env.new_string(auth_options.title)?;
    let subtitle = env.new_string(auth_options.subtitle)?;
    let description = env.new_string(auth_options.description)?;
    let cancel = env.new_string(auth_options.cancel)?;
    let accessible = env.new_string(auth_options.accessible)?;
    //let storage = env.new_string(auth_options.storage?)?;
    let security_level = env.new_string(auth_options.securityLevel)?;
    // let authentication_type = env.new_string(auth_options.authenticationType?)?;

    let mut access_control = JObject::from(env.new_string("None")?);

    if auth_type {
        access_control = JObject::from(env.new_string("BiometryCurrentSet")?);
    }

    let mut storage = JObject::from(env.new_string("KeystoreRSAECB")?);
    let sto = auth_options.storage;

    if let Some(s) = sto {
        storage = JObject::from(env.new_string(s)?);
    }

    let mut authentication_type = JObject::null();
    let aut = auth_options.authenticationType;

    if let Some(a) = aut {
        authentication_type = JObject::from(env.new_string(a)?);
    }

    let jservice = JValue::Object(&service);
    let jtitle = JValue::Object(&title);
    let jsubtitle = JValue::Object(&subtitle);
    let jdescription = JValue::Object(&description);
    let jcancel = JValue::Object(&cancel);
    let jaccessible = JValue::Object(&accessible);
    let jaccess_control = JValue::Object(&access_control);
    let jstorage = JValue::Object(&storage);
    let jsecurity_level = JValue::Object(&security_level);
    let jauthentication_type = JValue::Object(&authentication_type);

    let result = env.call_static_method(class, "constructOptions",
    "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)Ljava/util/Map;",
    &[jservice, jtitle, jsubtitle, jdescription, jcancel, jaccessible, jaccess_control, jstorage, jsecurity_level, jauthentication_type])?;

    let exceptions = env.exception_occurred()?;

    if exceptions.is_null() {
        println!("No exception occurred for options");
    } else {
        println!("Exception occurred for options");
        env.exception_describe()?;
        env.exception_clear()?;
    }

    let options = result.l()?;
    let jkey_type = env.new_string(key_type.to_string())?;
    let alias = env.new_string("AV_KEYSTORE")?;
    let context = unsafe { JObject::from_raw(activity as jni::sys::jobject) };

    print!("Before failure");
    let key = Java_com_example_keystore_KeyStoreModule_get(
        env, class2, alias, options, context, jkey_type,
    )?;

    let key = match auth_type {
        true => match key_type {
            "avl-p" => {
                let wallet = BetterAvailWallet::<N>::from_seed_bytes(&key)?;
                Keys::PrivateKey(wallet.private_key)
            }
            "avl-v" => {
                let view_key = ViewKey::<N>::from_bytes_le(&key)?;
                Keys::ViewKey(view_key)
            }
            _ => {
                return Err(AvailError::new(
                    AvailErrorType::InvalidData,
                    "Invalid key type".to_string(),
                    "Invalid key type".to_string(),
                ))
            }
        },
        false => {
            let password = password.ok_or(AvailError::new(
                AvailErrorType::Internal,
                "Login".to_string(),
                "Login".to_string(),
            ))?;
            match key_type {
                "avl-p" => {
                    let pkey_ciphertext = Ciphertext::<N>::from_bytes_le(&key)?;
                    let pkey = Encryptor::<N>::decrypt_private_key_with_secret(
                        &pkey_ciphertext,
                        password,
                    )?;

                    Keys::PrivateKey(pkey)
                }
                "avl-v" => {
                    let vkey_ciphertext = Ciphertext::<N>::from_bytes_le(&key)?;
                    let vkey =
                        Encryptor::<N>::decrypt_view_key_with_secret(&vkey_ciphertext, password)?;

                    Keys::ViewKey(vkey)
                }
                _ => {
                    return Err(AvailError::new(
                        AvailErrorType::InvalidData,
                        "Invalid key type".to_string(),
                        "Invalid key type".to_string(),
                    ))
                }
            }
        }
    };

    Ok(key)
}

///Deletes the data stored in SharedPreferences and the key in keystore.
#[tauri::command(rename_all = "snake_case")]
pub fn keystore_delete(password: Option<&str>) -> AvailResult<String> {
    let network = get_network()?;

    let _validation = match SupportedNetworks::from_str(&network)? {
        SupportedNetworks::Testnet3 => keystore_load::<Testnet3>(password, "avl-v")?,
    };

    let (jvm, activity) = prepare_jvm()?;

    let _env = jvm.attach_current_thread()?;

    let mut env = jvm.get_env()?;

    let class = env.find_class("com/example/keystore/KeyStoreModule")?;

    let alias = env.new_string("AV_KEYSTORE")?;
    let context = unsafe { JObject::from_raw(activity as jni::sys::jobject) };

    Java_com_example_keystore_KeyStoreModule_delete(env, class, alias, context)?;

    Ok("Keystore Deleted".to_string())
}

/// Checks if the device supports biometric authentication using jni
#[tauri::command(rename_all = "snake_case")]
pub fn device_auth_availability() -> AvailResult<bool> {
    let (jvm, activity) = prepare_jvm()?;

    jvm.attach_current_thread()?;

    let mut env = jvm.get_env()?;

    let class = env.find_class("com/example/keystore/KeyStoreModule")?;

    let context = unsafe { JObject::from_raw(activity as jni::sys::jobject) };

    Java_com_example_keystore_KeyStoreModule_check(env, class, context)
}

/// Checks if the app has permission to use biometric authentication
#[tauri::command(rename_all = "snake_case")]
pub fn device_auth_permission() -> AvailResult<bool> {
    let (jvm, activity) = prepare_jvm()?;

    jvm.attach_current_thread()?;

    let mut env = jvm.get_env()?;

    let class = env.find_class("com/example/keystore/KeyStoreModule")?;

    let context = unsafe { JObject::from_raw(activity as jni::sys::jobject) };

    Java_com_example_keystore_KeyStoreModule_permission(env, class, context)
}

#[cfg(test)]
mod tests {
    use super::*;
    use avail_common::models::constants::STRONG_PASSWORD;

    #[test]
    fn test_keystore_init_password() {
        let wallet = BetterAvailWallet::<Testnet3>::new().unwrap();

        let _result = keystore_init(
            STRONG_PASSWORD,
            false,
            &wallet.private_key,
            &wallet.view_key,
        )
        .unwrap();
    }

    //Requires android environment to run
    #[test]
    fn test_keystore_init_biometric() {
        let wallet = BetterAvailWallet::<Testnet3>::new().unwrap();

        let _result = keystore_init("", true, &wallet.private_key, &wallet.view_key).unwrap();
    }

    //Requires android environment to run if not password auth
    #[test]
    fn test_keystore_load() {
        let _result = keystore_load::<Testnet3>(Some(STRONG_PASSWORD), "avl-p").unwrap();
    }

    //Requires android environment to run
    #[test]
    fn test_keystore_delete() {
        let _result = keystore_delete(Some(STRONG_PASSWORD)).unwrap();
    }

    #[test]
    fn test_delete_wallet() {
        use crate::models::storage::persistent::PersistentStorage;
        let storage = PersistentStorage::new().unwrap();
        storage.execute_query("DROP TABLE wallet").unwrap();
    }

    #[test]
    fn test_vk_from_bytes() {
        let v_key = [
            208, 66, 183, 166, 111, 221, 124, 205, 251, 28, 154, 84, 205, 85, 179, 53, 10, 216,
            154, 110, 70, 94, 148, 38, 231, 248, 224, 159, 244, 81, 0, 0,
        ];

        let _hashkey = [
            87, 43, 111, 89, 49, 111, 82, 90, 55, 120, 119, 78, 52, 82, 98, 69, 97, 55, 74, 84,
            110, 76, 116, 67, 76, 82, 82, 82, 116, 100, 115, 69,
        ];

        let _view_key = ViewKey::<Testnet3>::from_bytes_le(&v_key).unwrap();
    }
}
