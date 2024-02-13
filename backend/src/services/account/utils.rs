//function to generate a discriminant of 4 random integers

use rand::Rng;

pub fn generate_discriminant() -> u32 {
    let mut rng = rand::thread_rng();
    let mut discriminant: u32 = 0;
    for _ in 0..4 {
        discriminant = discriminant * 10 + rng.gen_range(0..10);
    }
    discriminant
}

#[test]
fn test_generate_discriminant() {
    let discriminant = generate_discriminant();
    print!("discriminant: {}", discriminant);
    assert!(discriminant > 999 && discriminant < 10000);
}
