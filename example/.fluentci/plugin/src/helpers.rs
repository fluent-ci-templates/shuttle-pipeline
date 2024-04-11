use anyhow::Error;
use extism_pdk::FnResult;
use fluentci_pdk::dag;

pub fn setup_rust() -> FnResult<()> {
    let path = dag().get_env("PATH")?;
    let home = dag().get_env("HOME")?;
    let path = format!("{}:{}/.cargo/bin", path, home);
    dag().set_envs(vec![("PATH".into(), path)])?;

    dag()
        .pkgx()?
        .with_packages(vec!["curl"])?
        .with_exec(vec![
        "type rustup > /dev/null || curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh",
    ])?
        .stdout()?;

    Ok(())
}

pub fn get_os_arch() -> FnResult<String> {
    let os = dag().get_os()?;
    let arch = dag().get_arch()?;

    match os.as_str() {
        "linux" => match arch.as_str() {
            "x86_64" => Ok("x86_64-unknown-linux-gnu".into()),
            "aarch64" => Ok("aarch64-unknown-linux-musl".into()),
            _ => Err(Error::msg("Unsupported architecture").into()),
        },
        "macos" => match arch.as_str() {
            "x86_64" => Ok("x86_64-apple-darwin".into()),
            _ => Err(Error::msg("Unsupported architecture").into()),
        },
        _ => Err(Error::msg("Unsupported OS").into()),
    }
}
