use crate::helpers::setup_rust;
use extism_pdk::*;
use fluentci_pdk::dag;

pub mod helpers;

#[plugin_fn]
pub fn deploy(args: String) -> FnResult<String> {
    setup_rust()?;

    let mut shuttle_version = dag().get_env("SHUTTLE_VERSION").unwrap_or("v0.43.0".into());

    if shuttle_version.is_empty() {
        shuttle_version = "v0.43.0".into();
    }

    let os_arch = helpers::get_os_arch()?;

    let stdout = dag()
        .pkgx()?
        .with_packages(vec!["wget", "tar"])?
        .with_exec(vec!["type cargo-shuttle > /dev/null || ", "wget", &format!("https://github.com/shuttle-hq/shuttle/releases/download/{}/cargo-shuttle-{}-{}.tar.gz", shuttle_version, shuttle_version, os_arch)])?
        .with_exec(vec!["type cargo-shuttle > /dev/null || ", "tar", "xvf", &format!("cargo-shuttle-{}-{}.tar.gz", shuttle_version, os_arch)])?
        .with_exec(vec!["type cargo-shuttle > /dev/null || ", "mv", &format!("cargo-shuttle-{}-{}/cargo-shuttle", os_arch, shuttle_version), "$HOME/.cargo/bin"])?
        .with_exec(vec!["rm -rf cargo-shuttle-* || true"])?
        .with_exec(vec!["cargo", "shuttle", "login", "--api-key", "$SHUTTLE_API_KEY"])?
        .with_exec(vec!["cargo", "shuttle", "deploy", &args])?
        .stdout()?;
    Ok(stdout)
}
