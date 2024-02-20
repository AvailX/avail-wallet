use app_dirs::*;
use rusqlite::{
    params_from_iter,
    types::{FromSql, ToSql},
    Connection,
};

use avail_common::errors::AvailResult;

pub struct PersistentStorage {
    pub conn: Connection,
    db_path: String,
}

impl PersistentStorage {
    ///Creates a new instance of PersistentStorage
    pub fn new() -> AvailResult<Self> {
        let path = app_root(
            AppDataType::UserData,
            &AppInfo {
                name: "avail_wallet",
                author: "Avail",
            },
        )?;

        let db_path = path.into_os_string().into_string().unwrap();

        let conn = Connection::open(format!("{}/persistent.db", db_path))?;

        Ok(PersistentStorage { conn, db_path })
    }

    /// Create a table within the database with an SQL query
    pub fn execute_query(&self, query: &str) -> AvailResult<()> {
        self.conn.execute(query, ())?;

        Ok(())
    }

    /// Save a vector of items of the same type to a table within the database with an SQL query
    pub fn save<T: ToSql>(&self, data: Vec<T>, query: String) -> AvailResult<()> {
        let _insert = self.conn.execute(
            &query,
            //map data to params i.e data -> item1, item2 ..
            params_from_iter(data.into_iter()),
        )?;

        Ok(())
    }

    // Save a vector of items to a table within the database with an SQL query and allow for different types
    pub fn save_mixed(&self, data: Vec<&dyn ToSql>, query: String) -> AvailResult<()> {
        let _insert = self.conn.execute(
            &query,
            //map data to params i.e data -> item1, item2 ..
            params_from_iter(data.into_iter()),
        )?;

        Ok(())
    }

    /// Fetch a vector of items of the same type from a table within the database with an SQL query
    pub fn get<T: FromSql>(&self, query: String, item_count: usize) -> AvailResult<Vec<T>> {
        let mut statement = self.conn.prepare(&query)?;

        let mut key_iter = statement.query_map([], |row| {
            let data: Vec<T> = (0..item_count).flat_map(|i| row.get(i)).collect();

            Ok(data)
        })?;

        let vec = key_iter.next().unwrap().unwrap();

        Ok(vec)
    }

    /// Fetch a vector of items of the same type from a table within the database with an SQL query
    pub fn get_all<T: FromSql>(&self, query: &str, item_count: usize) -> AvailResult<Vec<Vec<T>>> {
        let mut statement = self.conn.prepare(query)?;

        let key_iter = statement.query_map([], |row| {
            let data = (0..item_count).flat_map(|i| row.get(i)).collect();
            Ok(data)
        })?;

        let key_vec = key_iter
            .map(|key| match key {
                Ok(key) => key,
                Err(_) => Vec::new(),
            })
            .collect::<Vec<Vec<T>>>();

        Ok(key_vec)
    }
}
#[test]
fn test_save() {
    let storage = PersistentStorage::new().unwrap();

    //create table test
    let query = "CREATE TABLE IF NOT EXISTS test (name TEXT, color TEXT)";

    let _res = storage.execute_query(query).unwrap();

    let query = "INSERT INTO test (name, color) VALUES (?, ?)".to_string();

    let data = vec!["test".to_string(), "blue".to_string()];

    let _res = storage.save(data, query).unwrap();

    //then test getting data from the database
    let query = "SELECT name, color FROM test".to_string();

    let res = storage.get::<String>(query, 2).unwrap();

    assert_eq!(res[0], "test".to_string());
    assert_eq!(res[1], "blue".to_string());
}

#[test]
fn test_get() {
    let storage = PersistentStorage::new().unwrap();
    //then test getting data from the database
    let query = "SELECT name, color FROM test".to_string();

    let res = storage.get::<String>(query, 2).unwrap();

    print!("{:?}", res);

    assert_eq!(res[0], "test".to_string());
    assert_eq!(res[1], "blue".to_string());
}
