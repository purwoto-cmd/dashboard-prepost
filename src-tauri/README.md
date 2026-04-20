# Tauri desktop (optional)

This folder is a scaffold only. Run `pnpm tauri init` locally to generate the
Rust crate (`src-tauri/src/main.rs`, `Cargo.toml`, platform icons). The
checked-in `tauri.conf.json` already wires `pnpm dev` / `pnpm build` as the
`beforeDevCommand` / `beforeBuildCommand`, so after `tauri init` you can run:

```
pnpm tauri dev
pnpm tauri build
```

Kept behind an optional dep (`@tauri-apps/cli`) so the web build does not pull
Rust toolchain into CI.
